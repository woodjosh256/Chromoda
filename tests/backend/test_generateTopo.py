import os
import unittest
import json
import subprocess


class TestGenerateTopo(unittest.TestCase):

    def test_generate_topo_valid_input(self):

        os.chdir('../../backend')

        # Prepare the test_event.json file that simulates the API Gateway event
        event = {
            "httpMethod": "GET",
            "queryStringParameters": {
                "tl_lon": "-94.9213",
                "tl_lat": "49.4823",
                "tr_lon": "-73.7544",
                "tr_lat": "49.4822",
                "bl_lon": "-94.9214",
                "bl_lat": "39.4275",
                "br_lon": "-73.7545",
                "br_lat": "39.4274",
                "lines": "25",
                "width": "1000"
            }
        }

        with open('../../backend/test_event.json', 'w') as f:
            json.dump(event, f)

        # Run the serverless function locally
        result = subprocess.run(
            ['sls', 'invoke', 'local', '-f', 'generateTopo', '-p',
             'test_event.json'],
            capture_output=True, text=True)

        # Parse and check the output
        output_json = json.loads(result.stdout)
        self.assertIsNotNone(output_json.get('some_expected_field'))
