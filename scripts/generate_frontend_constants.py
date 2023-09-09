import yaml
import json

# Load constants from YAML file
with open('./constants.yaml', 'r') as file:
    constants = yaml.safe_load(file)

# Convert constants to JSON
constants_json = json.dumps(constants)

# Generate JavaScript file
with open('./frontend/src/constants.js', 'w') as file:
    file.write('export const ' + ', '.join(f"{k} = {json.dumps(v)}" for k, v in constants.items()) + ';')
