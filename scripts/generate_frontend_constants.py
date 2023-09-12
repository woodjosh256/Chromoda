import yaml
import json
import re

# Load constants from YAML file
with open('./backend/constants.yaml', 'r') as file:
    constants = yaml.safe_load(file)

# Convert constants to JSON
constants_json = json.dumps(constants)

# Generate JavaScript file
with open('./frontend/src/constants.js', 'w') as file:
    file.write('export const ' + ', '.join(f"{k} = {json.dumps(v)}" for k, v in constants.items()) + ';')

def update_bag_value_tailwind(file_path, new_value):
    with open(file_path, 'r') as f:
        file_content = f.read()
    # print(file_content)
    updated_content = re.sub(r"'bag_ratio': '.*?'", f"'bag_ratio': '{new_value}'", file_content)
    # print(updated_content)
    with open(file_path, 'w') as f:
        f.write(updated_content)

file_path = './frontend/tailwind.config.js'
new_value = f"{constants['BAG_WIDTH']}/{constants['BAG_HEIGHT']}"
update_bag_value_tailwind(file_path, new_value)