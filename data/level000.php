<?php

print json_encode(Array(
  "player" => Array(
    "team" => "GDI"
  ),
  "enemy" => Array(
    "team" => "NOD"
  ),
  "map" => Array(
    "type" => "desert",
    "sx"   => 100,
    "sy"   => 100,
    "data" => Array(
      Array("rock1", (24 * 10), (24 * 10)),
      Array("rock2", (24 * 19), (24 * 10)),
      Array("rock3", (24 * 30), (24 * 30)),
      Array("rock4", (24 * 22), (24 * 22)),
      Array("rock5", (24 * 3), (24 * 15)),
      Array("rock6", (24 * 8), (24 * 13)),

      Array("tree4", (24 * 5), (24 * 5)),
      Array("tree8", (24 * 23), (24 * 23)),
      Array("tree8", (24 * 12), (24 * 12)),
      Array("tree18", (24 * 29), (24 * 32)),
      Array("tree8", (24 * 40), (24 * 3)),
      Array("tree8", (24 * 38), (24 * 10))
    )
  ),
  "objects" => Array(
    // Player 1
    Array("HUMVee",        0, (24 * 2),  (24 * 7)),
    Array("HUMVee",        0, (24 * 4),  (24 * 7)),
    Array("HUMVee",        0, (24 * 6),  (24 * 7)),
    Array("ConstructionYard", 0, (24 * 2), (24 * 2)),
    Array("Barracks",     0, (24 * 5), (24 * 2)),
    Array("Minigunner",  0, (24 * 20),  (24 * 2)),
    Array("Minigunner",  0, (24 * 20),  (24 * 3)),
    Array("Minigunner",  0, (24 * 20),  (24 * 4)),

    // Player 2
    Array("HUMVee",        1, 2000, 1700),
    Array("HUMVee",        1, 2000, 1750),
    Array("HUMVee",        1, 2000, 1800),
    Array("ConstructionYard", 1, 2000, 2000)
  )
));

?>
