"""QLoRA fine-tuning for telecom domain adaptation."""
import torch
from transformers import TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import Dataset
from src.utils import logger


class QLoRATrainer:
    """Fine-tune LLM using QLoRA for telecom domain."""
    
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
        
        # Prepare model for k-bit training
        self.model = prepare_model_for_kbit_training(self.model)
        
        # LoRA configuration
        self.lora_config = LoraConfig(
            r=16,  # LoRA rank
            lora_alpha=32,  # LoRA alpha
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
            lora_dropout=0.05,
            bias="none",
            task_type="CAUSAL_LM",
        )
        
        # Apply LoRA
        self.model = get_peft_model(self.model, self.lora_config)
        
        logger.info("QLoRA model prepared")
        self.model.print_trainable_parameters()
    
    def prepare_dataset(self, data: list[dict]) -> Dataset:
        """
        Prepare training dataset.
        
        Args:
            data: List of dicts with 'question', 'context', 'answer'
        
        Returns:
            Hugging Face Dataset
        """
        logger.info(f"Preparing dataset with {len(data)} examples")
        
        formatted_data = []
        for item in data:
            prompt = self._create_prompt(
                item["question"],
                item.get("context", ""),
            )
            
            formatted_data.append({
                "input": prompt,
                "output": item["answer"],
            })
        
        return Dataset.from_list(formatted_data)
    
    def _create_prompt(self, question: str, context: str) -> str:
        """Create training prompt."""
        if context:
            return f"""### Context:
{context}

### Question:
{question}

### Answer:
"""
        else:
            return f"""### Question:
{question}

### Answer:
"""
    
    def train(
        self,
        train_dataset: Dataset,
        output_dir: str = "./models/qlora_telecom",
        num_epochs: int = 3,
        batch_size: int = 4,
        learning_rate: float = 2e-4,
    ):
        """Train the model with QLoRA."""
        logger.info("Starting QLoRA training...")
        
        training_args = TrainingArguments(
            output_dir=output_dir,
            num_train_epochs=num_epochs,
            per_device_train_batch_size=batch_size,
            gradient_accumulation_steps=4,
            learning_rate=learning_rate,
            fp16=torch.cuda.is_available(),
            logging_steps=10,
            save_strategy="epoch",
            optim="paged_adamw_8bit",
            warmup_ratio=0.1,
            lr_scheduler_type="cosine",
        )
        
        def tokenize_function(examples):
            full_text = [
                inp + out for inp, out in zip(examples["input"], examples["output"])
            ]
            return self.tokenizer(
                full_text,
                truncation=True,
                max_length=512,
                padding="max_length",
            )
        
        tokenized_dataset = train_dataset.map(
            tokenize_function,
            batched=True,
            remove_columns=train_dataset.column_names,
        )
        
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=tokenized_dataset,
        )
        
        trainer.train()
        
        # Save model
        self.model.save_pretrained(output_dir)
        self.tokenizer.save_pretrained(output_dir)
        
        logger.info(f"Training complete. Model saved to {output_dir}")
        
        return trainer
