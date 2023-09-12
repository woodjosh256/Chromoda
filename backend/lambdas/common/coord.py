from dataclasses import dataclass


@dataclass(frozen=True)
class Coord:
    lat: float
    lon: float