
import pandas as pd
import numpy as np

# Load the dataset
df = pd.read_csv(r"C:\Users\ayush\AppData\Local\Temp\tmp6du69yjc.csv")

#User Instruction implementation
for col in df.columns:
    if df[col].isnull().any():
        if pd.api.types.is_numeric_dtype(df[col]):
            df[col] = df[col].fillna(0)
        else:
            df[col] = df[col].fillna('Not Available')


# Save the cleaned dataset
df.to_csv("output.csv", index=False)

# Print summary statistics after cleaning
print("Rows:", df.shape[0])
print("Columns:", df.shape[1])
print("Missing counts:", df.isnull().sum().to_dict())
print("Data types:", df.dtypes.to_dict())
