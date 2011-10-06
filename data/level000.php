<?php

print json_encode(Array(
  "data" => Array(
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
  ),
  "preload" => Array(
    'gfx' => Array(
      // Desert Theme
      "desert/tile",
      "desert/rock1",
      "desert/rock2",
      "desert/rock3",
      "desert/rock4",
      "desert/rock5",
      "desert/rock6",
      "desert/rock7",
      "desert/t04",
      "desert/t08",
      "desert/t09",
      "desert/t18",

      // GDI Stuff
      "gdi/units/jeep_sprite",
      "gdi/units/minigunner_sprite",
      "gdi/structures/hq_sprite",
      "gdi/structures/power_sprite",
      "gdi/structures/adv_power_sprite",
      "gdi/structures/barracks_sprite",
      "gdi/structures/refinery_sprite",
      "gdi/structures/factory_sprite",
      "gdi/structures/silo_sprite",
      "gdi/structures/comm_sprite",
      "gdi/structures/adv_comm_sprite",
      "gdi/structures/helipad_sprite",
      "gdi/structures/repair_sprite",
      "gdi/structures/guardtower_sprite",
      "gdi/structures/adv_guardtower_sprite"

      // NOD Stuff
    ),
    'snd' => Array(
      // Units
      "await1",
      "ackno",
      "affirm1",
      "yessir1",
      "roger",
      "movout1",
      "ritaway",
      "ritaway",
      "ugotit",
      "unit1",
      "vehic1"
    )
  )
));

?>
