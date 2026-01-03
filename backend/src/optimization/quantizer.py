"""Model quantization for edge deployment."""
import torch
from transformers import AutoModelForCausalLM
from src.utils import logger


class Quantizer:
    """Quantize models for efficient deployment."""
    
    @staticmethod
    def quantize_4bit(model_path: str, output_path: str) -> None:
        """
        Apply 4-bit quantization to model.
        
        Args:
            model_path: Path to original model
            output_path: Path to save quantized model
        """
        logger.info(f"Quantizing model from {model_path} to 4-bit...")
        
        from transformers import BitsAndBytesConfig
        
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
        )
        
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            quantization_config=quantization_config,
            device_map="auto",
        )
        
        model.save_pretrained(output_path)
        logger.info(f"4-bit quantized model saved to {output_path}")
    
    @staticmethod
    def quantize_8bit(model_path: str, output_path: str) -> None:
        """
        Apply 8-bit quantization to model.
        
        Args:
            model_path: Path to original model
            output_path: Path to save quantized model
        """
        logger.info(f"Quantizing model from {model_path} to 8-bit...")
        
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            load_in_8bit=True,
            device_map="auto",
        )
        
        model.save_pretrained(output_path)
        logger.info(f"8-bit quantized model saved to {output_path}")
    
    @staticmethod
    def benchmark_model(model, tokenizer, test_prompt: str = "What is 5G?") -> dict:
        """
        Benchmark model performance.
        
        Returns:
            Dict with latency, memory usage, etc.
        """
        import time
        
        logger.info("Benchmarking model...")
        
        inputs = tokenizer(test_prompt, return_tensors="pt").to(model.device)
        
        # Warmup
        with torch.no_grad():
            _ = model.generate(**inputs, max_new_tokens=50)
        
        # Benchmark
        start_time = time.time()
        with torch.no_grad():
            outputs = model.generate(**inputs, max_new_tokens=100)
        end_time = time.time()
        
        latency = end_time - start_time
        
        # Memory usage
        if torch.cuda.is_available():
            memory_mb = torch.cuda.max_memory_allocated() / 1024 / 1024
        else:
            memory_mb = 0
        
        return {
            "latency_seconds": latency,
            "memory_mb": memory_mb,
            "tokens_generated": len(outputs[0]) - len(inputs["input_ids"][0]),
        }
