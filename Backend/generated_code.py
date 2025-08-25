
import pandas as pd
import numpy as np
import os

# Define the input file path
input_filepath = r"C:\Users\ayush\AppData\Local\Temp\tmprdf006eq.csv"

# Define the output directory and filename
output_dir = os.path.dirname(input_filepath)
output_filename = "output.csv"
output_filepath = os.path.join(output_dir, output_filename)

# 1. Load the dataset
df = pd.read_csv(input_filepath)

# 2. Clean the data appropriately

# Handling Missing Values:

# Age: Impute missing 'Age' values with the median.
# The median is preferred over the mean for numerical data like age as it's less sensitive to outliers.
median_age = df['Age'].median()
df['Age'].fillna(median_age, inplace=True)

# Cabin: Drop the 'Cabin' column.
# With 687 out of 891 values missing (approx. 77%), this column has too many missing values
# to be reliably imputed or used without significant domain-specific strategies.
df.drop('Cabin', axis=1, inplace=True)

# Embarked: Impute missing 'Embarked' values with the mode.
# For categorical data, the mode (most frequent value) is a suitable imputation strategy.
# .mode()[0] is used to handle cases where there might be multiple modes.
mode_embarked = df['Embarked'].mode()[0]
df['Embarked'].fillna(mode_embarked, inplace=True)

# Handling Duplicates:
# The summary indicates 0 duplicates, so no action is required.
# If there were duplicates, df.drop_duplicates(inplace=True) would be used.

# Handling Inconsistent Formats and Outliers:
# Based on the provided summary, column data types are consistent with their content
# (e.g., 'Age' as float64, 'Name' as object).
# No specific instructions or clear indicators for outlier treatment were provided in the summary,
# so no explicit outlier handling steps are performed at this stage.

# 3. Save the cleaned dataset
df.to_csv(output_filepath, index=False)

# 4. Prints summary stats after cleaning
print("--- Cleaned Dataset Summary ---")
print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
print("\nMissing counts after cleaning:\n", df.isnull().sum())
print("\nData types after cleaning:\n", df.dtypes)
print("-" * 30)
print(f"Cleaned data saved to: {output_filepath}")