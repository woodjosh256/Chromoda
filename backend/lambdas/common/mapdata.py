import asyncio
import math
from io import BytesIO
from typing import List, Tuple

import skimage.transform
import svgwrite
from PIL import Image

import aiohttp
import mercantile
import numpy as np
import os

from shapely import LineString
from skimage import transform, filters, measure

try:
    from .coord import Coord
except ImportError:
    from backend.lambdas.common.coord import Coord


def int16_to_uint8(img_array: np.ndarray) -> np.ndarray:
    """Convert a 2D int16 numpy array to a 2D uint8 numpy array."""
    img_array = ((img_array - np.min(img_array)) / (
            np.max(img_array) - np.min(img_array)) * 255).astype(np.uint8)
    return img_array


def int16_array_to_image(img_array: np.ndarray) -> Image.Image:
    img_array_8bit = int16_to_uint8(img_array)
    img = Image.fromarray(img_array_8bit, 'L')  # 'L' indicates grayscale
    return img


class MapData:
    tile_size = 512

    def __init__(self, api_key: str = os.environ.get('MAPBOX_API_KEY')):
        self.api_key = api_key

    @classmethod
    def __pixels_to_left(cls, point: Coord, zoom: int):
        tile = mercantile.tile(point.lon, point.lat, zoom)
        bounds = mercantile.bounds(tile)
        width = bounds.east - bounds.west
        return (point.lon - bounds.west) / width * cls.tile_size

    @classmethod
    def __pixels_to_top(cls, point: Coord, zoom: int):
        tile = mercantile.tile(point.lon, point.lat, zoom)
        bounds = mercantile.bounds(tile)
        height = bounds.north - bounds.south
        return (bounds.north - point.lat) / height * cls.tile_size

    @classmethod
    def __pixels_to_bottom(cls, point: Coord, zoom: int):
        tile = mercantile.tile(point.lon, point.lat, zoom)
        bounds = mercantile.bounds(tile)
        height = bounds.north - bounds.south
        return (point.lat - bounds.south) / height * cls.tile_size

    @classmethod
    def __pixels_to_right(cls, point: Coord, zoom: int):
        tile = mercantile.tile(point.lon, point.lat, zoom)
        bounds = mercantile.bounds(tile)
        width = bounds.east - bounds.west
        return (bounds.east - point.lon) / width * cls.tile_size

    @classmethod
    def __pixels_between_pts(cls, a: Coord, b: Coord, zoom: int
                             ) -> int:
        tile_a = mercantile.tile(a.lon, a.lat, zoom)
        tile_b = mercantile.tile(b.lon, b.lat, zoom)

        pixel_ax = tile_a.x * cls.tile_size + cls.__pixels_to_left(a, zoom)
        pixel_ay = tile_a.y * cls.tile_size + cls.__pixels_to_top(a, zoom)
        pixel_bx = tile_b.x * cls.tile_size + cls.__pixels_to_left(b, zoom)
        pixel_by = tile_b.y * cls.tile_size + cls.__pixels_to_top(b, zoom)

        # Calculate the distance in pixels using the Euclidean distance formula
        distance = math.sqrt(
            (pixel_bx - pixel_ax) ** 2 + (pixel_by - pixel_ay) ** 2)

        return int(distance)

    @classmethod
    def __determine_zoom(cls, tl: Coord, tr: Coord, width: int) -> int:
        zoom = 0
        while True:
            px_width = cls.__pixels_between_pts(tl, tr, zoom)
            if px_width >= width or zoom == 14:
                return zoom
            zoom += 1

    @classmethod
    async def __fetch_tile(cls, session, url):
        async with session.get(url) as response:
            return await response.read()

    @classmethod
    async def __fetch_and_stitch_tile(cls, session: aiohttp.ClientSession,
                                      url: str, img_arr: np.ndarray, row: int,
                                      col: int):
        async with session.get(url) as response:
            tile_data = await response.read()
            try:
                tile_img = Image.open(BytesIO(tile_data))
            except Exception as e:
                # create a 512x512 image at sea level if the tile doesn't exist
                tile_img = Image.new('RGB', (512, 512), (1, 134, 160))
            
            tile_array = np.asarray(tile_img)

            r = tile_array[:, :, 0].astype(np.int32)
            g = tile_array[:, :, 1].astype(np.int32)
            b = tile_array[:, :, 2].astype(np.int32)

            elevation = -10000 + ((r * 256 * 256 + g * 256 + b) / 10)
            elevation = elevation.astype(np.int16)

            start_row, end_row = row * cls.tile_size, (row + 1) * cls.tile_size
            start_col, end_col = col * cls.tile_size, (col + 1) * cls.tile_size
            img_arr[start_row:end_row, start_col:end_col] = elevation[
                                                            :end_row - start_row,
                                                            :end_col - start_col]

    async def __fetch_all_tiles(self, tile_coords_list,
                                columns: int, img_arr: np.ndarray):
        async with aiohttp.ClientSession(
                connector=aiohttp.TCPConnector(limit_per_host=10)) as session:
            tasks = []
            cur_row = 0
            cur_col = 0
            for z, x, y in tile_coords_list:
                if cur_col == columns:
                    cur_col = 0
                    cur_row += 1
                url = f"https://api.mapbox.com/v4/mapbox.mapbox-terrain-dem-v1/{z}/{x}/{y}@2x.pngraw?access_token={self.api_key}"
                task = self.__fetch_and_stitch_tile(session, url, img_arr,
                                                    cur_row, cur_col)
                tasks.append(task)
                cur_col += 1

            await asyncio.gather(*tasks)

    def generate_padded_heightmap(self, tl: Coord, br: Coord, zoom: int):
        tl_tile = mercantile.tile(tl.lon, tl.lat, zoom)
        br_tile = mercantile.tile(br.lon, br.lat, zoom)

        tiles = []
        for y in range(tl_tile.y, br_tile.y + 1):
            for x in range(tl_tile.x, br_tile.x + 1):
                tiles.append((zoom, x, y))

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        rows_of_tiles = br_tile.y + 1 - tl_tile.y
        columns_of_tiles = br_tile.x + 1 - tl_tile.x

        stitched_img = np.ndarray(shape=(self.tile_size * rows_of_tiles,
                                         self.tile_size * columns_of_tiles),
                                  dtype=np.int16)


        loop.run_until_complete(
            self.__fetch_all_tiles(tiles, columns_of_tiles, stitched_img))

        return stitched_img

    @classmethod
    def __euclidean_distance(self, point_a: Tuple[int, int],
                             point_b: Tuple[int, int]):
        return np.sqrt(
            (point_a[0] - point_b[0]) ** 2 + (point_a[1] - point_b[1]) ** 2)

    @classmethod
    def __get_rect(cls, image: np.ndarray,
                   top_left: Tuple[int, int],
                   top_right: Tuple[int, int],
                   bottom_left: Tuple[int, int],
                   bottom_right: Tuple[int, int],
                   width: int) -> np.ndarray:
        src = np.array([top_left, top_right, bottom_left, bottom_right])
        height = int(width * cls.__euclidean_distance(top_left, bottom_left)
                     / cls.__euclidean_distance(top_left, top_right))
        dst = np.array([[0, 0], [width, 0], [0, height], [width, height]])

        tform = skimage.transform.AffineTransform()
        tform.estimate(src, dst)
        warped = skimage.transform.warp(image, inverse_map=tform.inverse)

        # crop warped to dst
        warped = warped[:height, :width]

        warped_int16 = np.round(warped * 32767).astype(np.int16)

        return warped_int16

    def __get_px_coord(self, coord: Coord, tl_tile: Tuple[int, int],
                       br_tile: Tuple[int, int], zoom: int) -> Tuple[int, int]:
        tile = mercantile.tile(coord.lon, coord.lat, zoom)

        base_px_x = (tile.x - tl_tile[0]) * self.tile_size
        base_px_y = (tile.y - tl_tile[1]) * self.tile_size

        offset_px_x = self.__pixels_to_left(coord, zoom)
        offset_px_y = self.__pixels_to_top(coord, zoom)

        final_px_x = int(base_px_x + offset_px_x)
        final_px_y = int(base_px_y + offset_px_y)

        return final_px_x, final_px_y

    def generate_heightmap(self, tl: Coord, tr: Coord, bl: Coord, br: Coord,
                           width: int):
        zoom = self.__determine_zoom(tl, tr, width)
        outer_tl = Coord(lon=min(tl.lon, tr.lon, bl.lon, br.lon),
                         lat=max(tl.lat, tr.lat, bl.lat, br.lat))
        outer_br = Coord(lon=max(tl.lon, tr.lon, bl.lon, br.lon),
                         lat=min(tl.lat, tr.lat, bl.lat, br.lat))
        padded_heightmap = self.generate_padded_heightmap(outer_tl, outer_br,
                                                          zoom)

        tl_tile = mercantile.tile(outer_tl.lon, outer_tl.lat, zoom)
        br_tile = mercantile.tile(outer_br.lon, outer_br.lat, zoom)

        return self.__get_rect(padded_heightmap,
                               self.__get_px_coord(tl, tl_tile, br_tile, zoom),
                               self.__get_px_coord(tr, tl_tile, br_tile, zoom),
                               self.__get_px_coord(bl, tl_tile, br_tile, zoom),
                               self.__get_px_coord(br, tl_tile, br_tile, zoom),
                               width)

    @classmethod
    def __generate_contour_svg(cls, heightmap, n):
        heightmap = filters.gaussian(heightmap, sigma=3)

        # Calculate the contour levels
        min_val = heightmap.min()
        max_val = heightmap.max()
        levels = np.linspace(min_val, max_val, n)

        # Initialize SVG drawing
        dwg = svgwrite.Drawing("contours.svg",
                               size=(heightmap.shape[1], heightmap.shape[0]))

        secondary_interval = 5

        # Generate contour lines for each level and add them to the SVG drawing
        for idx, level in enumerate(levels):
            contours = measure.find_contours(heightmap, level)
            for contour in contours:
                line = LineString(contour)
                simplified_contour = line.simplify(0.1, preserve_topology=True)

                points = [(y, x) for x, y in
                          simplified_contour.coords]  # Note: scikit-image uses (row, col) indexing
                polyline = dwg.polyline(points=points,
                                        stroke=svgwrite.rgb(0, 0, 0, '%'),
                                        stroke_width=1.7,
                                        fill='none',
                                        class_=f"e{str(level)}{' secondary' if idx % secondary_interval == 0 else ''}")

                dwg.add(polyline)
        return dwg

    def get_contours(self, tl: Coord, tr: Coord, bl: Coord, br: Coord,
                     width: int, n: int):
        heightmap = self.generate_heightmap(tl, tr, bl, br, width)
        # todo - refactor so it creates an object that stores these values so
        #  this method doesn't need to return two values
        return self.__generate_contour_svg(heightmap, n)


# md = MapData()
# img = md.generate_heightmap(Coord(lon=-89.34883192641215, lat=50.0951048226766),
#                             Coord(lon=-78.3904492620223, lat=45.97213875665682),
#                             Coord(lon=-93.4624638362534, lat=45.1775102491446),
#                             Coord(lon=-82.50387485431594,
#                                   lat=40.66205642956018),
#                             400)
# img.show()

# Top Left: -96.40530502960567,53.87062368349805
# Top Right: -70.8922224835333,49.72233935110722
# Bottom Left: -100.88818369291192,42.58415473432717
# Bottom Right: -75.37571589108417,37.44656026397743

# md2 = MapData()
# img2 = md2.generate_heightmap(
#     Coord(lon=-96.40530502960567, lat=53.87062368349805),
#     Coord(lon=-70.8922224835333, lat=49.72233935110722),
#     Coord(lon=-100.88818369291192, lat=42.58415473432717),
#     Coord(lon=-75.37571589108417, lat=37.44656026397743),
#     400)

# Top Left: -103.45009445615698,38.63936627419022
# Top Right: -106.56713561203591,35.76059029500513
# Bottom Left: -105.86704317498112,40.243205705612496
# Bottom Right: -108.98156301982877,37.4275267642447


# Top Left: 89.61557464541443,28.16624828642692
# Top Right: 90.85525061370276,28.935045512553643
# Bottom Left: 90.19742772174163,27.431008811486564
# Bottom Right: 91.43885119145051,28.206947844186658


# Top Left: -97.60781350198876,46.1554748320809
# Top Right: -80.01837084094592,54.21503671402186
# Bottom Left: -89.17330990661537,37.415187460042574
# Bottom Right: -71.58341534687632,46.75842653536185

# md = MapData()
# svg = md.get_contours(
#     Coord(lon=-97.60781350198876, lat=46.1554748320809),
#     Coord(lon=-80.01837084094592, lat=54.21503671402186),
#     Coord(lon=-89.17330990661537, lat=37.415187460042574),
#     Coord(lon=-71.58341534687632, lat=46.75842653536185),
#     1000,
#     25)
# print(svg.tostring())
# svg.save()