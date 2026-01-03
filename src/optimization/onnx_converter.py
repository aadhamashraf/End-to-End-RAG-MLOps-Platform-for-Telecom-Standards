"""ONNX model conversion."""
import torch
from pathlib import Path
from src.utils import logger


class ONNXConverter:
    """Convert PyTorch models to ONNX format."""
    
    @staticmethod
    def convert_to_onnx(
        model,
        tokenizer,
        output_path: str,
        opset_version: int = 14,
    ) -> None:
        """
        Convert model to ONNX format.
        
        Args:
            model: PyTorch model
            tokenizer: Model tokenizer
            output_path: Path to save ONNX model
            opset_version: ONNX opset version
        """
        logger.info(f"Converting model to ONNX (opset {opset_version})...")
        
        # Create dummy input
        dummy_input = tokenizer(
            "What is 5G?",
            return_tensors="pt",
            max_length=512,
            padding="max_length",
        )
        
        # Export to ONNX
        torch.onnx.export(
            model,
            (dummy_input["input_ids"], dummy_input["attention_mask"]),
            output_path,
            export_params=True,
            opset_version=opset_version,
            do_constant_folding=True,
            input_names=["input_ids", "attention_mask"],
            output_names=["output"],
            dynamic_axes={
                "input_ids": {0: "batch_size", 1: "sequence"},
                "attention_mask": {0: "batch_size", 1: "sequence"},
                "output": {0: "batch_size", 1: "sequence"},
            },
        )
        
        logger.info(f"ONNX model saved to {output_path}")
    
    @staticmethod
    def optimize_onnx(input_path: str, output_path: str) -> None:
        """
        Optimize ONNX model.
        
        Args:
            input_path: Path to input ONNX model
            output_path: Path to save optimized model
        """
        logger.info(f"Optimizing ONNX model from {input_path}...")
        
        import onnx
        from onnxruntime.transformers import optimizer
        
        # Load model
        model = onnx.load(input_path)
        
        # Optimize
        optimized_model = optimizer.optimize_model(
            input_path,
            model_type="bert",  # Generic transformer optimization
            num_heads=0,  # Auto-detect
            hidden_size=0,  # Auto-detect
        )
        
        # Save
        optimized_model.save_model_to_file(output_path)
        logger.info(f"Optimized ONNX model saved to {output_path}")
