import os
from pathlib import Path

def create_dataset_structure():
    print("="*60)
    print("📦 CREATING WEAPON DATASET STRUCTURE")
    print("="*60)
    
    dataset_dir = Path("weapon_dataset")
    
    dirs = [
        "weapon_dataset/images/train",
        "weapon_dataset/images/val",
        "weapon_dataset/labels/train",
        "weapon_dataset/labels/val"
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created: {dir_path}")
    
    print("\n" + "="*60)
    print("📥 DOWNLOAD WEAPON DATASET")
    print("="*60)
    print("\nManual Download Steps:")
    print("1. Visit: https://universe.roboflow.com/weapon-detection")
    print("2. Search for 'Weapon Detection YOLOv8' dataset")
    print("3. Download in 'YOLOv8' format")
    print("4. Extract files to: weapon_dataset/")
    print("\nOR use this direct link:")
    print("https://public.roboflow.com/ds/w6K5qG4cHv?key=wJ9w3T8HNa")
    print("\n" + "="*60)

if __name__ == '__main__':
    create_dataset_structure()
