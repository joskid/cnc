
/**
 * Main CnC Configuration
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package CnC
 * @repo    https://github.com/andersevenrud/cnc
 */
(function(undefined) {

  var _ou = 1;
  var _ov = 2;
  var _ob = 3;

  //
  // INTERNALS
  //
  CnC.OBJECT_UNIT        = _ou;
  CnC.OBJECT_VEHICLE     = _ov;
  CnC.OBJECT_BUILDING    = _ob;

  CnC.OBJECT_CLASSNAMES  = {
    1 : "MapObjectUnit",
    2 : "MapObjectVehicle",
    3 : "MapObjectBuilding"
  };

  CnC.SOUND_SELECT       = 0;
  CnC.SOUND_MOVE         = 1;
  CnC.SOUND_ATTACK       = 2;
  CnC.SOUND_DIE          = 3;

  CnC.AUDIO_CODECS = {
    "ogg" : 'audio/ogg; codecs="vorbis"', // OGG
    "mp3" : 'audio/mpeg'                  // MP3
  };

  //
  // Overlays
  //
  CnC.MapOverlays = {
    'rock1' : {
      'image'  : "desert/rock1",
      'width'  : 71,
      'height' : 47,
      'x'      : 31, //71 / 2,
      'y'      : 43 //42 / 2
    },
    'rock2' : {
      'image'  : "desert/rock2",
      'width'  : 71,
      'height' : 23,
      'x'      : 21, //71 / 2,
      'y'      : 23 /// 2
    },
    'rock3' : {
      'image'  : "desert/rock3",
      'width'  : 71,
      'height' : 47,
      'x'      : 20, //71 / 2,
      'y'      : 42 //47 / 2
    },
    'rock4' : {
      'image'  : "desert/rock4",
      'width'  : 42,
      'height' : 21,
      'x'      : 12, //42 / 2,
      'y'      : 21 / 2
    },
    'rock5' : {
      'image'  : "desert/rock5",
      'width'  : 39,
      'height' : 18,
      'x'      : 12, //39 / 2,
      'y'      : 18 /// 2
    },
    'rock6' : {
      'image'  : "desert/rock6",
      'width'  : 71,
      'height' : 47,
      'x'      : 30, //71 / 2,
      'y'      : 47 //42 / 2
    },
    'rock7' : {
      'image'  : "desert/rock7",
      'width'  : 109,
      'height' : 22,
      'x'      : 48, //109 / 2,
      'y'      : 22 /// 2
    },

    'tree4' : {
      'image'  : "desert/t04",
      'width'  : 23,
      'height' : 23,
      'x'      : 8, //23 / 2,
      'y'      : 17 //23 / 2
    },
    'tree8' : {
      'image'  : "desert/t08",
      'width'  : 48,
      'height' : 25,
      'x'      : 17, //48 / 2,
      'y'      : 20 //25 / 2
    },
    'tree9' : {
      'image'  : "desert/t09",
      'width'  : 47,
      'height' : 23,
      'x'      : 10, //47 / 2,
      'y'      : 22 //23 / 2
    },
    'tree18' : {
      'image'  : "desert/t18",
      'width'  : 71,
      'height' : 47,
      'x'      : 32, //71 / 2,
      'y'      : 40 //47 / 2
    },
    'water' : {
      'image'  : "desert/water",
      'width'  : 24,
      'height' : 24,
      'x'      : 12,
      'y'      : 12
    },
    'coast_s' : {
      'image'  : "desert/coast_s",
      'width'  : 24,
      'height' : 24,
      'x'      : 12,
      'y'      : 12
    }
  }; // Public namespace

  // Object Metadata
  CnC.MapObjectsMeta = {
    "GDI" : {
      "structures" : {
        "ConstructionYard" : {
          "image"      : null,
          "title"      : "Construction Yard",
          "desc"       : "The Construction Yard is the foundation of a base and allows the construction of other buildings.",
          "object" : {
            'type'   : _ob,
            'width'  : 72,
            'height' : 48,
            'sprite' : {
              'src' : "gdi/structures/hq_sprite",
              'cw'  : 72,
              'ch'  : 48,
              'animation' : [
                0 * 72,
                1 * 72,
                2 * 72,
                3 * 72
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 100
            },
            'mask' : [0, 0, 72, 48],
            'sounds' : {}
          }
        },
        "PowerPlan" : {
          "image"      : "power_plant",
          "title"      : "Power Plan",
          "desc"       : "This unit provides power to adjoining structures. Power output is directly related to the Power Plant's condition, so protect them during battles.",
          "object" : {
            'type'   : _ob,
            'width'  : 48,
            'height' : 48,
            'sprite' : {
              'src' : "gdi/structures/power_sprite",
              'cw'  : 48,
              'ch'  : 48,
              'animation' : [
                0 * 48,
                1 * 48,
                2 * 48,
                3 * 48
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 100
            },
            'mask' : [0, 0, 48, 48],
            'sounds' : {}
          }
        },
        "AdvancedPowerPlan" : {
          "image"      : "adv_power_plant",
          "title"      : "Advanced Power Plant",
          "desc"      : "This high-yield structure handles the energy strains of some later, more power intensive structures. Double the power output of the Power Plant.",
          "object" : {
            'type'   : _ob,
            'width'  : 48,
            'height' : 48,
            'sprite' : {
              'src' : "gdi/structures/adv_power_sprite",
              'cw'  : 48,
              'ch'  : 48,
              'animation' : [
                0 * 48,
                1 * 48,
                2 * 48,
                3 * 48
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 100
            },
            'mask' : [0, 0, 48, 48],
            'sounds' : {}
          }
        },
        "Barracks" : {
          "image"      : "barracks",
          "title"      : "Barracs (Unit facility)",
          "desc"       : "This structure is a field training center for all available infantry units.",
          "object" : {
            'type'   : _ob,
            'width'  : 48,
            'height' : 48,
            'sprite' : {
              'src' : "gdi/structures/barracks_sprite",
              'cw'  : 72,
              'ch'  : 48,
              'animation' : [
                0 * 48,
                1 * 48,
                2 * 48,
                3 * 48,
                4 * 48,
                5 * 48,
                6 * 48,
                7 * 48,
                8 * 48,
                9 * 48
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 50
            },
            'mask' : [0, 0, 72, 48],
            'sounds' : {}

          }
        },
        "Refinery" : {
          "image" : "refinery",
          "title" : "Tiberium Refinery",
          "desc"  : "This unit processes Tiberium into its component elements. Building the Refinery immediately deploys a Tiberium harvester and each Refinery can handle an infinite number of Harvesters. The Refinery stores 1,000 credits of processed Tiberium.",
          "object" : {
            'type'   : _ob,
            'width'  : 72,
            'height' : 72,
            'sprite' : {
              'src' : "gdi/structures/refinery_sprite",
              'cw'  : 72,
              'ch'  : 72,
              'animation' : [
                0 * 72,
                1 * 72,
                2 * 72,
                3 * 72,
                4 * 72,
                5 * 72,
                6 * 72
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 100
            },
            'mask' : [0, 0, 72, 72],
            'sounds' : {}
          }
        },
        "Silo" : {
          "image" : "tiberium_silo",
          "title" : "Tiberium Silo",
          "desc"  : "This unit stores up to 1,500 credits of processed Tiberium. Guard it carefully. If destroyed or captured, the amount stored is deducted from your account.",
          "object" : {
            'type'   : _ob,
            'width'  : 48,
            'height' : 24,
            'sprite' : {
              'src' : "gdi/structures/silo_sprite",
              'cw'  : 48,
              'ch'  : 24,
              'animation' : [
                0
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 100
            },
            'mask' : [0, 0, 72, 72],
            'sounds' : {}
          }
        },
        "Factory" : {
          "image" : "weapons_factory",
          "title" : "Weapons Factory (Vehicle facility)",
          "desc"  : "This structure produces all of the GDI's light and heavy vehicles. Some units can't be built until upgrade mandates are met.",
          "object" : {
            'type'   : _ob,
            'width'  : 72,
            'height' : 72,
            'sprite' : {
              'src' : "gdi/structures/factory_sprite",
              'cw'  : 72,
              'ch'  : 72,
              'animation' : [
                0
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 100
            },
            'mask' : [0, 0, 72, 72],
            'sounds' : {}
          }
        },
        "CommunicationCenter" : {
          "image" : "comm_center",
          "title" : "Communications Center",
          "desc"  : "Allows the use of the radar screen as long as there is sufficient power.",
          "object" : {
            'type'   : _ob,
            'width'  : 48,
            'height' : 48,
            'sprite' : {
              'src' : "gdi/structures/comm_sprite",
              'cw'  : 48,
              'ch'  : 48,
              'animation' : [
                0 * 48,
                1 * 48,
                2 * 48,
                3 * 48,
                4 * 48,
                5 * 48,
                6 * 48,
                7 * 48,
                8 * 48,
                9 * 48,
                10 * 48,
                11 * 48,
                12 * 48,
                13 * 48,
                14 * 48,
                15 * 48
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 100
            },
            'mask' : [0, 0, 48, 48],
            'sounds' : {}
          }
        },
        "AdvancedCommunicationCenter" : {
          "image" : "adv_comm",
          "title" : "Advanced Communications Center",
          "desc"  : "An upgrade to the Communications Center, this structure not only provides radar, but is the uplink center for the Orbital Ion Cannon.",
          "object" : {
            'type'   : _ob,
            'width'  : 48,
            'height' : 48,
            'sprite' : {
              'src' : "gdi/structures/adv_comm_sprite",
              'cw'  : 48,
              'ch'  : 48,
              'animation' : [
                0 * 48,
                1 * 48,
                2 * 48,
                3 * 48,
                4 * 48,
                5 * 48,
                6 * 48,
                7 * 48,
                8 * 48,
                9 * 48,
                10 * 48,
                11 * 48,
                12 * 48,
                13 * 48,
                14 * 48,
                15 * 48
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 100
            },
            'mask' : [0, 0, 48, 48],
            'sounds' : {}
          }
        },
        "Helipad" : {
          "image" : "helipad",
          "title" : "Helipad (Helicopter facility)",
          "desc"  : "Building the Helipad allows the use of the Orca attack aircraft. Each Orca requires a Helipad.",
          "object" : {
            'type'   : _ob,
            'width'  : 48,
            'height' : 48,
            'sprite' : {
              'src' : "gdi/structures/helipad_sprite",
              'cw'  : 48,
              'ch'  : 48,
              'animation' : [
                0 * 48,
                1 * 48,
                2 * 48,
                3 * 48,
                4 * 48,
                5 * 48,
                6 * 48
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 100
            },
            'mask' : [0, 0, 48, 48],
            'sounds' : {}
          }
        },
        "RepairFacility" : {
          "image" : "repair_facility",
          "title" : "Repair facility",
          "desc"  : " This structure produces all of the GDI's light and heavy vehicles. Some units can't be built until upgrade mandates are met.",
          "object" : {
            'type'   : _ob,
            'width'  : 72,
            'height' : 72,
            'sprite' : {
              'src' : "gdi/structures/repair_sprite",
              'cw'  : 72,
              'ch'  : 72,
              'animation' : [
                0
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 100
            },
            'mask' : [0, 0, 72, 72],
            'sounds' : {}
          }
        },
        "GuardTower" : {
          "image" : "guard_tower",
          "title" : "Guard Tower (defence)",
          "desc"  : "Armed with a high velocity machine gun, this structure provides manned defense against Nod ground attack.",
          "object" : {
            'type'   : _ob,
            'width'  : 24,
            'height' : 24,
            'sprite' : {
              'src' : "gdi/structures/guardtower_sprite",
              'cw'  : 24,
              'ch'  : 24,
              'animation' : [
                0
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 100
            },
            'mask' : [0, 0, 24, 24],
            'sounds' : {}
          }
        },
        "AdvancedGuardTower" : {
          "image" : "adv_guard_tower",
          "title" : "Advanced Guard Tower (defence)",
          "desc"  : "Provides strong fortification against Nod ground and air units. Weapons complement includes a rocket launcher.",
          "object" : {
            'type'   : _ob,
            'width'  : 24,
            'height' : 48,
            'sprite' : {
              'src' : "gdi/structures/adv_guardtower_sprite",
              'cw'  : 24,
              'ch'  : 48,
              'animation' : [
                0
              ]
            },
            'attrs'  : {
              'movable'   : false,
              'speed'     : 0,
              'turning'   : 0,
              'strength'  : 100
            },
            'mask' : [0, 0, 24, 24],
            'sounds' : {}
          }
        },
        "SandbagBarrier" : {
          "image" : "sandbag_barrier",
          "title" : "Sandbag Barrier (defence)",
          "desc"  : "Used to deter the enemy from advancing. Sandbags provide limited cover and may slow units down."
        },
        "ConcreteBarrier" : {
          "image" : "concrete_barrier",
          "title" : "Concrete Barrier (defence)",
          "desc"  : "Concrete walls are the most effective barrier. They are much harder to destroy and will take the enemy much longer to blast through."
        },
        "ChainLinkBarrier" : {
          "image" : "chain_link_barrier",
          "title" : "Chain-Link Barrier (defence)",
          "desc"  : "Chain Link fences will stop light vehicles, yet can be crushed or even destroyed by most heavier vechicles."
        }
      },

      "units"      : {
        "Minigunner" : {
          "image"  : "minigunner",
          "title"  : "Minigunner",
          "desc"   : 'Equipped with the GAU-3 "Eliminator" 5.56mm chain gun and light body armour, this troop is the key player in the GDI forces.',
          "object" : {
            'type'   : _ou,
            'width'  : 50,
            'height' : 39,
            'color'  : "0,255,0",
            'sprite' : {
              'src' : "gdi/units/minigunner_sprite",
              'cw'  : 50,
              'ch'  : 39,
              'rot' : 45,
              'mov' : 65
            },
            'attrs'  : {
              'movable'   : true,
              'speed'     : 5,
              'turning'   : 0,
              'strength'  : 10
            },
            'mask' : [0, 0, 50, 39],
            'sounds' : {
              /* SOUND_SELECT */ 0 : ["await1", "yessir1"],
              /* SOUND_MOVE */   1 : ["roger", "movout1", "ritaway", "ritaway", "ugotit", "affirm1", "ackno"]
            }
          }
        },
        "Grenaider" : {
          "image" : "grenaider",
          "title" : "Grenaider",
          "desc"  : 'Using grenades as a principal form of attack, grenade infantry can throw over barriers to great effect.'
        },
        "Engineer" : {
          "image" : "engineer",
          "title" : "Engineer",
          "desc"  : 'Engineers are used to capture enemy buildings. Since they carry no weapons, they are extremely vulnerable on the battlefield and must be directed very carefully.'
        },
        "Commando" : {
          "image" : "commando",
          "title" : "Commando",
          "desc"  : "The Commando is part of the GDI Elite Forces Unit. The Commando will be dispatched under your command for special missions in the GDI's service. This unit uses a high powered Raptor 50cal. assault rifle with suppressor and long range/IR vision enhancement goggles and is extremely specialised in demolitions and stealth."
        },
        "Harvester" : {
          "image" : "harvester",
          "title" : "Tiberium Harvester",
          "desc"  : "This armor-plated vehicle seeks out and scoops up raw Tiberium, then transports it to Refineries for processing. It is slow and unwieldy."
        },
        "HUMVee" : {
          "image"  : "hum-vee",
          "title"  : "HUM-Vee",
          "desc"   : "These all terrain attack vehicles are armed with a 7.62mm chaingun. Its light armour makes it the fastes vehicle in the GDI's arsenal.",
          "object" : {
            'type'   : _ov,
            'width'  : 24,
            'height' : 24,
            'color' : "0,0,255",
            'sprite' : {
              'src' : "gdi/units/jeep_sprite",
              'cw'  : 24,
              'ch'  : 24,
              'rot' : 11.25
            },
            'attrs'  : {
              'movable'   : true,
              'speed'     : 10,
              'turning'   : 10,
              'strength'  : 10
            },
            'mask' : [0, 0, 24, 24],
            'sounds' : {
              /* SOUND_SELECT */ 0 : ["unit1", "vehic1"],
              /* SOUND_MOVE */   1 : ["roger", "movout1", "ritaway", "ritaway", "ugotit", "affirm1", "ackno"]
            }

          }
        },
        "MediumTank" : {
          "image" : "medium_tank",
          "title" : "Medium Tank",
          "desc"  : "From its single barrel, the Medium Tank fires armor piercing shells. It is faster, heavier and more destructive than Nod's Light Tank."
        },
        "MRLS" : {
          "image" : "mrls",
          "title" : "Mobile Rocket Launch System",
          "desc"  : "Mobile devastation. GDI's longest-range attacker fires 227mm rockets. With no short range fighting ability, this unit needs close quarter backup."
        },
        "APC" : {
          "image" : "apc",
          "title" : "Armored Personal Carrier",
          "desc"  : "The Armored Personnel Carrier (APC) transports and protects up to five troops heading to and from battle locations."
        },
        "MCV" : {
          "image" : "mcv",
          "title" : "Mobile Construction Vehicle",
          "desc"  : "The mobile construction vehicle lets you search for suitable base sites. Once one is found, deploy the MCV into a full service Construction Yard and use it to build other structures."
        },
        "MammothTank" : {
          "image" : "mammoth_tank",
          "title" : "Mammoth (Heavy) Tank",
          "desc"  : "Armed with dual 120mm cannons, this giant has dual missile packs to help compensate for its lack of speed and mobility."
        },
        "Chinook" : {
          "image" : "chinook",
          "title" : "Chinook Transport Helicopter",
          "desc"  : 'The Transport "Chinook" Helicopter provides field transportation for all infantry, rapidly deploying new troops into, or out of battle.'
        },
        "Orca" : {
          "image" : "orca",
          "title" : "ORCA Helicopter",
          "desc"  : "This vertical takeoff and landing (VTOL) craft has a nose mounted 30mm chaingun complemented by four Fang rockets."
        }
      }
    },




    "NOD" : {
      "structures" : {
        "ConstructionYard" : {
          "image" : null,
          "title" : "Construction Yard",
          "desc"  : "The Construction Yard is the foundation of a base and allows the construction of other buildings."
        },
        "PowerPlan" : {
          "image" : "power_plant",
          "title" : "Power Plan",
          "desc"  : "This unit provides power to adjoining structures. Power output is directly related to the Power Plant's condition, so protect them during battles."
        },
        "AdvancedPowerPlan" : {
          "image" : "adv_power_plant",
          "title" : "Advanced Power Plant",
          "desc"  : "This high-yield structure handles the energy strains of some later, more power intensive structures. Double the power output of the Power Plant."
        },
        "HandOfNod" : {
          "image" : "hand_of_nod",
          "title" : "Hand Of NOD (Unit facility)",
          "desc"  : "This building creates elite infantry units for the Brotherhood of Nod."
        },
        "Refinery" : {
          "image" : "refinery",
          "title" : "Tiberium Refinery",
          "desc"  : "This unit processes Tiberium into its component elements. Building the Refinery immediately deploys a Tiberium harvester and each Refinery can handle an infinite number of Harvesters. The Refinery stores 1,000 credits of processed Tiberium."
        },
        "Silo" : {
          "image" : "tiberium_silo",
          "title" : "Tiberium Silo",
          "desc"  : "This unit stores up to 1,500 credits of processed Tiberium. Guard it carefully. If destroyed or captured, the amount stored is deducted from your account."
        },
        "Airstrip" : {
          "image" : "air_strip",
          "title" : "Air Strip (Vehicle facility)",
          "desc"  : "The Brotherhood of Nod buys all its units. The Air Strip allows cargo planes to land safely and deliver vital equipment. It is functionally equivalent to the GDI Weapons Factory."
        },
        "CommunicationCenter" : {
          "image" : "comm_center",
          "title" : "Communications Center",
          "desc"  : "Allows the use of the radar screen as long as there is sufficient power."
        },
        "TempleOfNod" : {
          "image" : "temple_of_nod",
          "title" : "Temple Of NOD",
          "desc"  : "Houses the central computer core that is the hub of all Nod communications and center of Nod command. It is heavily armored."
        },
        "Helipad" : {
          "image" : "helipad",
          "title" : "Helipad (Helicopter facility)",
          "desc"  : "Building the Helipad allows the use of the Apache attack aircraft. Each Apache requires a Helipad."
        },
        "RepairFacility" : {
          "image" : "repair_facility",
          "title" : "Repair facility",
          "desc"  : "Repairs damaged vehicles. All repairs are deducted from your credits. Damage to the facility significantly slows repair work."
        },
        "Turret" : {
          "image" : "turret",
          "title" : "Turret (defence)",
          "desc"  : "For broad sweep, short range protection against heavy assault vehicles."
        },
        "Obelisk" : {
          "image" : "obelisk",
          "title" : "Obelisk of Light (defence)",
          "desc"  : "This high power laser effectively destroys troops and armament at long range. You must have excess power to operate the Obelisk of Light safely."
        },
        "SAMSite" : {
          "image" : "sam_site",
          "title" : "SAM Site (defence)",
          "desc"  : "Fires surface-to-air missiles at airborne GDI units."
        },
        "SandbagBarrier" : {
          "image" : "sandbag_barrier",
          "title" : "Sandbag Barrier (defence)",
          "desc"  : "Used to deter the enemy from advancing. Sandbags provide limited cover and may slow units down."
        },
        "ConcreteBarrier" : {
          "image" : "concrete_barrier",
          "title" : "Concrete Barrier (defence)",
          "desc"  : "Concrete walls are the most effective barrier. They are much harder to destroy and will take the enemy much longer to blast through."
        },
        "ChainLinkBarrier" : {
          "image" : "chain_link_barrier",
          "title" : "Chain-Link Barrier (defence)",
          "desc"  : "Chain Link fences will stop light vehicles, yet can be crushed or even destroyed by most heavier vechicles."
        }
      },

      "units"      : {
        "Minigunner" : {
          "image" : "minigunner",
          "title" : "Minigunner",
          "desc"  : 'Equipped with the GAU-3 "Eliminator" 5.56mm chain gun and light body armour, this troop is the key player in the GDI forces.'
        },
        "Rocketeer" : {
          "image" : "rocket_soldier",
          "title" : "Rocketeer",
          "desc"  : 'Portable rocket launchers create more damage at a greater range. These units can fire from lower to higher elevations and attack air units.'
        },
        "Engineer" : {
          "image" : "engineer",
          "title" : "Engineer",
          "desc"  : 'Engineers are used to capture enemy buildings. Since they carry no weapons, they are extremely vulnerable on the battlefield and must be directed very carefully.'
        },
        "Flamethrower" : {
          "image" : "flame_thrower",
          "title" : "Flame Thrower",
          "desc"  : 'Effective for maximum close range destruction. Produces fire which burns more slowly than normal, allowing more effective elimination of humans and armament.'
        },
        "ChemWarrior" : {
          "image" : "chemical_warrior",
          "title" : "Chemical Warrior",
          "desc"  : 'The Chem-Warrior is an advanced infantry unit immune to the effects of Tiberium. The chem-blast they carry produces a short lived toxic cloud of Tiberium gas that will kill any infantry caught within its effects.'
        },
        "Harvester" : {
          "image" : "harvester",
          "title" : "Tiberium Harvester",
          "desc"  : "This armor-plated vehicle seeks out and scoops up raw Tiberium, then transports it to Refineries for processing. It is slow and unwieldy."
        },
        "Buggy" : {
          "image" : "buggy",
          "title" : "Buggy",
          "desc"  : "These all-terrain vehicles are armed with an assault weapons mounted in a turret."
        },
        "LightTank" : {
          "image" : "light_tank",
          "title" : "Light Tank",
          "desc"  : "This highly mobile tread vehicle, delivers maximum enemy unit and personnel destruction with minimum weight, maintenance and weaponry."
        },
        "MobileArtillery" : {
          "image" : "artillery",
          "title" : "Mobile Artillery",
          "desc"  : "The biggest weapon in the Nod arsenal, this massive mobile cannon has great range and ballistic power. Slow and unwieldy, it needs close quarter protection."
        },
        "FlameTank" : {
          "image" : "flame_tank",
          "title" : "Flame Tank",
          "desc"  : "When strategy calls for total short range annihilation with minimum exposure, this light armoured tank fits the bill. Especially useful against infantry."
        },
        "StealthTank" : {
          "image" : "stealth_tank",
          "title" : "Stealth Tank",
          "desc"  : 'This lightly armored, mobile tank is equipped with the "Lazarus" shield whick makes it invisible. This sheild is neutralised during firing. Backup protect is provided by two high powered missiles.'
        },
        "SSM" : {
          "image" : "ssm_launcher",
          "title" : "Surface-To-Surface Missile Launcher (SSM)",
          "desc"  : "The SSM is Nod's longest ranged unit, able to fire on the enemy from a great distance. Its napalm rounds are useful at cracking through tough base defenses without any worry of retaliation. Infantry in a large group will also suffer from its high area of effect. The reload rate on this unit is extremely long, requiring other units to protect it during its lag time."
        },
        "APC" : {
          "image" : "apc",
          "title" : "Armored Personal Carrier",
          "desc"  : "The Armored Personnel Carrier (APC) transports and protects up to five troops heading to and from battle locations."
        },
        "MCV" : {
          "image" : "mcv",
          "title" : "Mobile Construction Vehicle",
          "desc"  : "The mobile construction vehicle lets you search for suitable base sites. Once one is found, deploy the MCV into a full service Construction Yard and use it to build other structures."
        },
        "Chinook" : {
          "image" : "chinook",
          "title" : "Chinook Transport Helicopter",
          "desc"  : 'The Transport "Chinook" Helicopter provides field transportation for all infantry, rapidly deploying new troops into, or out of battle.'
        },
        "Apache" : {
          "image" : "apache",
          "title" : "Apache Helicopter",
          "desc"  : "Nod's Apache Helicopter is fast, mobile, and carries a large quantity of ammunition. Used primarily against infantry and structures, the Apache can take down armored units when en-masse."
        }
      }
    }
  }; // Public namespace


  /**
   * Main function for data.js
   * @return void
   */
  (function() {

    /**
     * Apply animations on objects
     * @return void
     */
    function ApplyAnimations(o) {
      var ref, obj, i, j, t, px, movment;

      for ( i in o ) {
        if ( o.hasOwnProperty(i) ) {
          ref = o[i];           // { image, title, desc, object, ... }
          obj = ref.object;     //  => { type, width, height, sprite, ... }

          if ( obj && obj.sprite )
          {
            movment = (obj.sprite.mov !== undefined);

            //
            // Add rotation and movment animations for objects
            //
            if ( obj.sprite.rot !== undefined ) {
              obj.sprite.rotation = {};
              if ( movment ) {
                obj.sprite.movment = {};
              }

              //
              // Rotation
              //
              px = 0;
              for ( j = 360; j > 0; j -= obj.sprite.rot ) {
                obj.sprite.rotation[j] = px;
                if ( movment ) {
                  obj.sprite.movment[j]  = [];
                }
                px += obj.sprite.cw;
              }

              //
              // Movment
              //
              if ( movment ) {
                /*
                var tmp = px; /// 399
                var rot = (360 / obj.sprite.rot); /// 8
                var mov = obj.sprite.mov; // 65
                for ( j = 0; j < mov; j++ ) {
                  for ( t in obj.sprite.movment ) {
                    if ( obj.sprite.movment.hasOwnProperty(t) ) {
                      obj.sprite.movment[t].push(px);
                    }
                  }
                  px += obj.sprite.cw;
                }
                */
              }
            }

          }
        }
      }

      //console.info("data.js: Fixed objects", o);
    }

    // Apply all animations
    ApplyAnimations(CnC.MapObjectsMeta.GDI.units);
    ApplyAnimations(CnC.MapObjectsMeta.NOD.units);
  })();

})();

