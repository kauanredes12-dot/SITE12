/*
# Add digital access information to products

## Plain-English summary
Each product can now store a short text explaining how the buyer receives and accesses the digital material.

## 1. Modified table: products
- access_info (text, optional): digital access instructions shown to the administrator and available for the store.

## Security
- No change to access rules. Existing policies still apply.

## Important notes
1. Existing products start with an empty value.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS access_info text;
