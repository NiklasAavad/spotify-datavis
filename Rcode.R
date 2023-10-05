# Might need to install some of the libraries first
library(naniar)
library(readr)
library(dplyr)

# Path to the downloaded dataset 
dataset_file_path = 'Documents/Uni/DaVis/charts.csv'
data_raw <- read_csv(dataset_file_path, show_col_types = FALSE)

# 10,000 random samples
data_samples = data_raw %>% slice_sample(n = 10000)

# View missingness map
vis_miss(data_samples)

# filtering all data from Denmark
data_denmark = data_raw %>% filter(region == 'Denmark')
data_denmark_top200 = data_denmark %>% filter(chart == 'top200')
data_denmark_viral50 = data_denmark %>% filter(chart == 'viral50')

data_denmark_samples = data_denmark %>% slice_sample(n=10000)

vis_miss(data_denmark_samples)

# top200 only
data_top200 = data_raw %>% filter(chart == 'top200')
samples_top200 = data_top200 %>% slice_sample(n = 10000)
vis_miss(samples_top200)

# Regions
str(data_top200)

# Count the unique regions
unique_regions <- unique(data_top200$region)
unique_regions_comma <- paste(unique_regions, collapse = ", ")
cat(unique_regions_comma)

# Get data for each region
region_data <- split(data_top200, data_top200$region)

# Use lapply to split each region's data by date
filtered_data_list <- lapply(region_data, function(region_df) {
  split(region_df, region_df$date)
})

# Count for each date for each region
result <- data_top200 %>%
  group_by(region, date) %>%
  summarize(count = n())

# Total count for each region
result2 <- data_top200 %>% group_by(date) %>% group_by(region) %>% summarize(count = n())
