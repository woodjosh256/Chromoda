# necessary for python requirements serverless package
try:
    import unzip_requirements
except ImportError:
    pass

from typing import Dict, Any
from dataclasses import dataclass
from .common.api_responses import _200, _400
from .common.coord import Coord
from .common.mapdata import MapData

# constants
tile_resolution = 512
panel_width = 505
panel_height = 337


@dataclass(frozen=True)
class Params:
    tl: Coord
    tr: Coord
    bl: Coord
    br: Coord
    width: int
    lines: int


def get_req_param(param: str, event: Dict[str, Any]) -> Any:
    val = event.get(param)
    if val is None:
        raise ValueError(f"Parameter {param} missing from API params.\n" +
                         f"Parameters: {str(event)}")
    return val


def get_params(event: Dict[str, Any]) -> Params:
    q_params = event.get('queryStringParameters')
    if q_params is None:
        raise ValueError("Missing queryStringParameters.\n" +
                         f"event: {str(event)}")

    return Params(
        tl=Coord(lon=float(get_req_param('tl_lon', q_params)),
                 lat=float(get_req_param('tl_lat', q_params))),
        tr=Coord(lon=float(get_req_param('tr_lon', q_params)),
                 lat=float(get_req_param('tr_lat', q_params))),
        bl=Coord(lon=float(get_req_param('bl_lon', q_params)),
                 lat=float(get_req_param('bl_lat', q_params))),
        br=Coord(lon=float(get_req_param('br_lon', q_params)),
                 lat=float(get_req_param('br_lat', q_params))),
        width=int(get_req_param('width', q_params)),
        lines=int(get_req_param('lines', q_params)),
    )


def verify_input(tl: Coord, br: Coord) -> Dict:
    """ verify coordinates for a rectangle (at any angle)"""
    pass


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
    params = get_params(event)
    md = MapData()
    return _200({
        "svg": md.get_contours(
            params.tl, params.tr, params.bl, params.br, params.width,
            params.lines
        ).tostring()
    })
