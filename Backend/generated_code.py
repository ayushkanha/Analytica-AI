
import pandas as pd
import numpy as np

# Load the dataset
df = pd.read_csv(r"C:\Users\ayush\AppData\Local\Temp\tmpn6slt61b.csv")

# 1. Handling Missing Values:
# The summary shows missing values in columns '5' and '10'.  We'll impute them with the mean.

for col in ['5', '10']:
    df[col] = df[col].fillna(df[col].mean())


# 2. Handling potential outliers (Illustrative - adapt based on domain knowledge):
#  Outliers are subjective and depend on the context. This is a simple example.  A more robust approach might use IQR or other statistical methods.

# Example:  If a bowler's average is extremely high, it might be an outlier.
# This is a simplified check; a more sophisticated analysis might be needed in a real-world scenario.
# df = df[df['Ave'] < 100] # Remove rows where Ave is unrealistically high


# 3. Data Type Consistency:
# The summary indicates consistent data types. No action needed here.

# 4. Duplicate Check: Already handled (0 duplicates).

# 5. Save the cleaned dataset
df.to_csv("output.csv", index=False)

# 6. Print summary statistics after cleaning
print("Dataset Summary After Cleaning:")
print("Rows:", len(df))
print("Columns:", len(df.columns))
print("Missing Values:", df.isnull().sum())
print("Data Types:", df.dtypes)
