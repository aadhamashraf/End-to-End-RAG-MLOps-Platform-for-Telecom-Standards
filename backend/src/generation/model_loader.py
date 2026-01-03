"""Model loading for LLMs."""
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from src.utils import settings, logger


class ModelLoader:
    """Load and manage LLM models."""
    
    def __init__(self, model_name: str = None, use_4bit: bool = True):
        self.model_name = model_name or settings.base_model
        self.use_4bit = use_4bit
        self.model = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        logger.info(f"Initializing ModelLoader for: {self.model_name}")
        logger.info(f"Device: {self.device}")
    
    def load(self):
        """Load model and tokenizer."""
        logger.info("Loading tokenizer...")
        self.tokenizer = AutoTokenizer.from_pretrained(
            self.model_name,
            trust_remote_code=True,
            token=settings.hf_token,
        )
        
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
        
        logger.info("Loading model...")
        
        if self.use_4bit and self.device == "cuda":
            # 4-bit quantization config
            bnb_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_quant_type="nf4",
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
            )
            
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                quantization_config=bnb_config,
                device_map="auto",
                trust_remote_code=True,
                token=settings.hf_token,
            )
        else:
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None,
                trust_remote_code=True,
                token=settings.hf_token,
            )
            
            if self.device == "cpu":
                self.model = self.model.to(self.device)
        
        logger.info("Model loaded successfully")
        return self.model, self.tokenizer
    
    def get_model_info(self) -> dict:
        """Get model information."""
        if self.model is None:
            return {"status": "not_loaded"}
        
        param_count = sum(p.numel() for p in self.model.parameters())
        trainable_params = sum(p.numel() for p in self.model.parameters() if p.requires_grad)
        
        return {
            "model_name": self.model_name,
            "device": self.device,
            "total_params": param_count,
            "trainable_params": trainable_params,
            "quantized": self.use_4bit,
        }


# Global model loader
_model_loader = None


def get_model_loader() -> ModelLoader:
    """Get or create global model loader."""
    global _model_loader
    if _model_loader is None:
        _model_loader = ModelLoader()
        _model_loader.load()
    return _model_loader
