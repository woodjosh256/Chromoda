# necessary for python requirements serverless package
try:
    import unzip_requirements
except ImportError:
    pass

from typing import Dict, Any
from dataclasses import dataclass
from .common.api_responses import _200, _400
from .common.coord import Coord
from .common.secret import MAPBOX_API_KEY

# constants
tile_resolution = 512
panel_width = 1200
panel_height = 300

@dataclass(frozen=True)
class Params:
    tl: Coord
    br: Coord

def verify_input(tl: Coord, br: Coord) -> Dict:
    """ verify coordinates for a rectangle (at any angle)"""
    




"""
Steps:
1. Input verification
2. Calculate optimum zoom level
3. Calculate bounding tile coordinates
4. Generate heightmap from  tiles
5. Crop to bounding box coords
5. Transform to Grayscale heightmap
6. Generate contour lines
"""
def handler(event: Dict[str, Any], context: Any) -> Dict:
    return _200({"message": "Hello World!"})
