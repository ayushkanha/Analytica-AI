
import pandas as pd
import numpy as np
import os

# Define the file path for the dataset
file_path = r"C:\Users\ayush\AppData\Local\Temp\tmprf72rbej.csv"

# 1. Load the dataset
df = pd.read_csv(file_path)

# 2. Clean the data appropriately

# Handle missing values:
# - 'Age': Impute with the median, as it's a numerical column and median is robust to outliers.
df['Age'].fillna(df['Age'].median(), inplace=True)

# - 'Cabin': Drop the column due to a very high percentage of missing values (687 out of 891 rows).
df.drop('Cabin', axis=1, inplace=True)

# - 'Embarked': Impute with the mode, as it's a categorical column.
#   .mode()[0] is used because mode() can return multiple values if there's a tie.
df['Embarked'].fillna(df['Embarked'].mode()[0], inplace=True)

# Duplicates: The summary states 0 duplicates, so no action needed.
# Inconsistent formats: Data types are appropriate as per the summary, no action needed.
# Outliers: Not explicitly handled in this general cleaning phase based on the provided summary.

# Determine the directory of the input file to save the output file there
output_directory = os.path.dirname(file_path)
output_file_name = "output.csv"
output_file_path = os.path.join(output_directory, output_file_name)

# 3. Save the cleaned dataset
df.to_csv(output_file_path, index=False) # index=False prevents pandas from writing the DataFrame index as a column

# 4. Print summary stats after cleaning
print(f"Rows: {df.shape[0]}")
print(f"Columns: {df.shape[1]}")
print("Missing counts after cleaning:\n", df.isnull().sum())
print("\nData types after cleaning:\n", df.dtypes)