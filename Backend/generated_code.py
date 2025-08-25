
import pandas as pd
import numpy as np
import os

# Define the input file path
input_filepath = r"C:\Users\ayush\AppData\Local\Temp\tmpf4mvh_rg.csv"

# 1. Load the dataset
df = pd.read_csv(input_filepath)

# 2. Clean the data appropriately

# Based on the provided summary:
# - Missing values: The 'missing_counts' dictionary shows 0 missing values for all columns.
#   Therefore, no imputation or dropping of missing values is required.
# - Duplicates: The 'duplicates' count is 0.
#   Therefore, no duplicate rows need to be handled.
# - Inconsistent formats:
#   - The 'Age' column is of type 'float64'. The sample values (e.g., 38.0, 35.0, 54.0)
#     suggest that all age values are whole numbers represented as floats.
#     Converting 'Age' to 'int64' is a common and appropriate step for age data,
#     making the data type more precise and potentially saving memory.
#   - Other data types ('int64', 'object', 'float64') appear consistent with their
#     respective column contents based on typical dataset characteristics.
# - Outliers: The provided summary does not include statistical measures (like min/max,
#   quartiles, standard deviation) that would allow for programmatic detection and
#   handling of outliers. Thus, no outlier treatment will be performed.

# Cleaning step: Convert 'Age' from float64 to int64
# This is safe because 'Age' has no missing values (as per missing_counts)
# and sample values indicate they are whole numbers.
df['Age'] = df['Age'].astype(int)

# No other cleaning steps are explicitly required based on the provided summary.
# Columns like 'Name', 'Ticket', 'Cabin', 'Embarked' are of 'object' type, which
# is expected for string/categorical data. Further processing (e.g., feature
# engineering) might be done on these, but it's not considered "cleaning" in
# the sense of fixing inconsistencies or errors in this context.

# 3. Save the cleaned dataset as "output.csv" in the same directory
output_directory = os.path.dirname(input_filepath)
output_filepath = os.path.join(output_directory, "output.csv")
df.to_csv(output_filepath, index=False)

# 4. Print summary stats after cleaning
print("Summary statistics after cleaning:")
print(f"Rows: {df.shape[0]}")
print(f"Columns: {df.shape[1]}")
print("\nMissing counts per column:")
print(df.isnull().sum())
print("\nData types per column:")
print(df.dtypes)