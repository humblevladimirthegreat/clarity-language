#!/usr/bin/env python3
"""Generate metaphor+mnemonic JSON for lexicon quality pass."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# emoji -> (metaphorical, mnemonic)
M = {
    # place-other
    "🌍": ("world", "earth is the planet; world is all life on it"),
    "🌎": ("world", "earth is the planet; world is all life on it"),
    "🌏": ("world", "earth is the planet; world is all life on it"),
    "🌐": ("connected", "a globe links every place; connected means linked together"),
    "🗺️": ("plan", "a map charts a route; a plan charts a course"),
    "🗾": ("regional", "a map of one land; regional is that area's identity"),
    "🧭": ("direction", "a compass points the way; direction is where you're headed"),
    "🏔️": ("challenge", "mountains are hard to climb; a challenge is hard to face"),
    "⛰️": ("challenge", "mountains are hard to climb; a challenge is hard to face"),
    "🌋": ("eruption", "a volcano bursts outward; eruption is bursting emotion"),
    "🗻": ("landmark", "a peak recognized from afar; landmark is something memorable"),
    "🏕️": ("escape", "camping leaves daily life behind; escape is getting away"),
    "🏖️": ("relaxation", "the beach is for rest; relaxation is rest"),
    "🏜️": ("barren", "a desert has little life; barren is empty of results"),
    "🏝️": ("isolation", "an island stands apart; isolation is standing apart"),
    "🏞️": ("refuge", "a park is a green refuge; refuge is safe respite"),
    "🏟️": ("arena", "a stadium hosts competition; arena is any contest ground"),
    "🪨": ("stability", "rock does not shift; stability is holding firm"),
    "🪵": ("raw", "wood is unfinished material; raw is unprocessed state"),
    "⛲": ("renewal", "flowing water refreshes; renewal is fresh beginning"),
    "⛺": ("temporary", "a tent is not permanent shelter; temporary does not last"),
    "🌁": ("obscurity", "fog hides the view; obscurity hides what is clear"),
    "🌃": ("unknown", "night hides what day shows; unknown is what is hidden"),
    "🏙️": ("urban", "towers and lights fill the skyline; urban is city life"),
    "🌄": ("dawn", "sun rises over peaks; dawn is a new beginning"),
    "🌅": ("dawn", "sun rises on the horizon; dawn is a new beginning"),
    "🌆": ("closure", "dusk ends the day; closure is bringing something to an end"),
    "🌇": ("closure", "sunset ends the day; closure is bringing something to an end"),
    "🌉": ("connection", "a bridge links two shores; connection links two sides"),
    "♨️": ("rejuvenation", "hot springs restore the body; rejuvenation restores energy"),
    "🎠": ("cycle", "carousel horses go in circles; cycle repeats round and round"),
    "🎡": ("perspective", "ferris wheel rises for a wider view; perspective sees the bigger picture"),
    "🎢": ("volatility", "roller coaster rises and drops; volatility swings up and down"),
    "💈": ("grooming", "barber pole marks a trim; grooming is tending appearance"),
    "🎪": ("spectacle", "circus tent promises a show; spectacle is a striking display"),
    # place-building
    "🏛️": ("institution", "grand columns mark public power; institution is established order"),
    "🏗️": ("progress", "scaffolding rises as things get built; progress is things rising"),
    "🧱": ("foundation", "bricks stack from the ground up; foundation is the base layer"),
    "🛖": ("shelter", "a hut keeps you covered; shelter is basic cover"),
    "🏘️": ("neighborhood", "many houses side by side; neighborhood is nearby community"),
    "🏚️": ("decay", "a house falling apart; decay is falling apart"),
    "🏠": ("home", "a house is walls and roof; home is where you belong"),
    "🏡": ("domestic", "house with garden; domestic is everyday private life"),
    "🏢": ("corporate", "tall offices for business; corporate is organized commerce"),
    "🏣": ("delivery", "post office sends mail out; delivery is sending something through"),
    "🏤": ("delivery", "post office sends mail out; delivery is sending something through"),
    "🏥": ("healing", "hospital treats the sick; healing is making whole again"),
    "🏦": ("security", "bank keeps money safe; security is kept safe"),
    "🏨": ("hospitality", "hotel welcomes travelers; hospitality is welcoming guests"),
    "🏩": ("intimacy", "love hotel marks private romance; intimacy is close private bond"),
    "🏪": ("convenience", "corner store is always nearby; convenience is easy to reach"),
    "🏫": ("learning", "school is where lessons happen; learning is gaining knowledge"),
    "🏬": ("variety", "department store holds many goods; variety is many options"),
    "🏭": ("production", "factory makes goods at scale; production is making output"),
    "🏯": ("fortress", "castle walls defend within; fortress is defended stronghold"),
    "🏰": ("fortress", "castle walls defend within; fortress is defended stronghold"),
    "💒": ("union", "wedding chapel joins two people; union is joining together"),
    "🗼": ("ambition", "tower rises above all else; ambition rises above the ordinary"),
    "🗽": ("freedom", "liberty lifts her torch; freedom is liberation from constraint"),
    "⛪": ("faith", "church gathers believers; faith is trust in what is unseen"),
    "🕌": ("faith", "mosque gathers believers; faith is trust in what is unseen"),
    "🛕": ("faith", "temple gathers believers; faith is trust in what is unseen"),
    "🕍": ("faith", "synagogue gathers believers; faith is trust in what is unseen"),
    "⛩️": ("faith", "shrine marks sacred ground; faith is trust in what is unseen"),
    "🕋": ("pilgrimage", "kaaba draws the faithful; pilgrimage is a sacred journey"),
    # transport-ground
    "🚂": ("momentum", "train stays on its track; momentum keeps moving forward"),
    "🚃": ("momentum", "train stays on its track; momentum keeps moving forward"),
    "🚄": ("speed", "bullet train races ahead; speed is moving very fast"),
    "🚅": ("speed", "bullet train races ahead; speed is moving very fast"),
    "🚆": ("momentum", "train stays on its track; momentum keeps moving forward"),
    "🚇": ("underground", "metro runs beneath the city; underground is hidden from view"),
    "🚈": ("commute", "light rail serves daily riders; commute is the daily journey"),
    "🚉": ("hub", "station connects many routes; hub is where paths meet"),
    "🚊": ("commute", "tram carries city riders; commute is the daily journey"),
    "🚝": ("commute", "monorail carries city riders; commute is the daily journey"),
    "🚞": ("scenic", "mountain rail climbs with views; scenic is beauty along the way"),
    "🚋": ("commute", "tram carries city riders; commute is the daily journey"),
    "🚌": ("commute", "bus carries many riders daily; commute is the daily journey"),
    "🚍": ("commute", "bus carries many riders daily; commute is the daily journey"),
    "🚎": ("commute", "trolleybus carries city riders; commute is the daily journey"),
    "🚐": ("shuttle", "van moves a small group; shuttle is moving a group along"),
    "🚑": ("emergency", "ambulance rushes to crisis; emergency is urgent crisis"),
    "🚒": ("rescue", "fire truck races to danger; rescue is saving from harm"),
    "🚓": ("authority", "police car enforces the law; authority is lawful power"),
    "🚔": ("authority", "police car enforces the law; authority is lawful power"),
    "🚕": ("hire", "taxi is hired for a ride; hire is paying for service"),
    "🚖": ("hire", "taxi is hired for a ride; hire is paying for service"),
    "🚗": ("mobility", "car moves you where you choose; mobility is freedom to move"),
    "🚘": ("mobility", "car moves you where you choose; mobility is freedom to move"),
    "🚙": ("utility", "suv hauls gear and people; utility is practical usefulness"),
    "🛻": ("haul", "pickup carries heavy loads; haul is carrying a heavy load"),
    "🚚": ("haul", "truck carries heavy freight; haul is carrying a heavy load"),
    "🚛": ("haul", "truck carries heavy freight; haul is carrying a heavy load"),
    "🚜": ("cultivation", "tractor works the fields; cultivation is growing and tending"),
    "🏎️": ("competition", "race car fights for first place; competition is striving to win"),
    "🏍️": ("rebellion", "motorcycle breaks from the pack; rebellion is breaking from norms"),
    "🛵": ("convenience", "scooter slips through traffic; convenience is quick and easy"),
    "🦽": ("accessibility", "wheelchair enables movement; accessibility is equal access"),
    "🦼": ("accessibility", "powered wheelchair enables movement; accessibility is equal access"),
    "🛺": ("hire", "rickshaw is hired for a ride; hire is paying for service"),
    "🚲": ("effort", "bike moves only when you pedal; effort is work you put in"),
    "🛴": ("convenience", "kick scooter is quick and light; convenience is quick and easy"),
    "🛹": ("daring", "skateboard rides the edge; daring is bold risk-taking"),
    "🛼": ("glide", "roller skates roll smoothly along; glide is smooth easy motion"),
    "🚏": ("waiting", "bus stop is where you wait; waiting is holding for what comes"),
    "🛣️": ("fastlane", "motorway speeds long trips; fastlane is the quickest path"),
    "🛤️": ("route", "railway marks a fixed path; route is the path you follow"),
    "⛽": ("refuel", "gas station fills the tank; refuel is restoring energy"),
    "🚨": ("urgency", "siren demands immediate attention; urgency is acting now"),
    "🚥": ("signal", "traffic light tells go or stop; signal is a clear instruction"),
    "🚦": ("signal", "traffic light tells go or stop; signal is a clear instruction"),
    "🛑": ("halt", "stop sign means do not proceed; halt is bringing movement to stop"),
    "🚧": ("blockage", "construction blocks the road; blockage is something in the way"),
    # transport-water
    "⚓": ("grounding", "anchor holds the ship steady; grounding is staying steady"),
    "⛵": ("journey", "sailboat crosses open water; journey is travel over distance"),
    "🛶": ("exploration", "canoe probes quiet waters; exploration is seeking the unknown"),
    "🚤": ("rush", "speedboat cuts across waves; rush is moving with haste"),
    "🛳️": ("voyage", "cruise ship crosses oceans; voyage is a long sea journey"),
    "⛴️": ("crossing", "ferry links two shores; crossing is going from one side to another"),
    "🛥️": ("leisure", "motorboat skims for pleasure; leisure is relaxed enjoyment"),
    "🚢": ("voyage", "ship crosses open seas; voyage is a long sea journey"),
    # transport-air
    "✈️": ("elevation", "plane rises above the ground; elevation is rising above"),
    "🛩️": ("elevation", "small plane rises above land; elevation is rising above"),
    "🛫": ("departure", "plane lifting off leaves the ground; departure is setting out"),
    "🛬": ("arrival", "plane touching down reaches destination; arrival is reaching the end"),
    "🪂": ("descent", "parachute slows a fall; descent is coming down safely"),
    "💺": ("passive", "seat holds you while others move; passive is not acting yourself"),
    "🚁": ("rescue", "helicopter hovers to reach the stranded; rescue is saving from harm"),
    "🚟": ("ascent", "suspension rail climbs overhead; ascent is rising upward"),
    "🚠": ("ascent", "cable car climbs the slope; ascent is rising upward"),
    "🚡": ("ascent", "cable car climbs the slope; ascent is rising upward"),
    "🛰️": ("surveillance", "satellite orbits and watches below; surveillance is watching from afar"),
    "🚀": ("launch", "rocket blasts into the sky; launch is a bold start"),
    "🛸": ("unknown", "ufo is unexplained in the sky; unknown is not yet understood"),
    "🛎️": ("service", "bellhop answers guest calls; service is attending to needs"),
    "🧳": ("baggage", "luggage is what you carry along; baggage is what you carry with you"),
    # time
    "⌛": ("finite", "sand runs out in the hourglass; finite is having a limit"),
    "⏳": ("finite", "sand runs out in the hourglass; finite is having a limit"),
    "⌚": ("punctuality", "watch tracks the exact moment; punctuality is being on time"),
    "⏰": ("urgency", "alarm clock demands you wake; urgency is acting now"),
    "⏱️": ("measurement", "stopwatch counts every second; measurement is precise tracking"),
    "⏲️": ("deadline", "timer counts down to zero; deadline is the moment time runs out"),
    "🕰️": ("passage", "mantel clock marks hours passing; passage is time going by"),
}

# clock faces — literal readings; weak figurative link
CLOCK_REVIEW = {
    "🕛": "twelve", "🕧": "twelve-thirty", "🕐": "one", "🕑": "one-thirty",
    "🕒": "two", "🕓": "two-thirty", "🕔": "three", "🕕": "three-thirty",
    "🕖": "four", "🕗": "four-thirty", "🕘": "five", "🕙": "five-thirty",
    "🕚": "six", "🕛": "six-thirty",  # note: user list had errors; map by standard names
}
# Standard clock face set (24 entries)
CLOCK_FACES = [
    ("🕛", "twelve"), ("🕧", "twelve-thirty"),
    ("🕐", "one"), ("🕑", "one-thirty"),
    ("🕒", "two"), ("🕓", "two-thirty"),
    ("🕔", "three"), ("🕕", "three-thirty"),
    ("🕖", "four"), ("🕗", "four-thirty"),
    ("🕘", "five"), ("🕙", "five-thirty"),
    ("🕚", "six"), ("🕦", "six-thirty"),
    ("🕐", "seven"), ("🕑", "seven-thirty"),
    ("🕒", "eight"), ("🕓", "eight-thirty"),
    ("🕔", "nine"), ("🕕", "nine-thirty"),
    ("🕖", "ten"), ("🕗", "ten-thirty"),
    ("🕘", "eleven"), ("🕙", "eleven-thirty"),
]
# Same emoji reused for different hours in Unicode — only one key per emoji in JSON.
# User listed duplicate glyphs; we map each unique emoji once with REVIEW.
for emoji in ["🕛", "🕧", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕦"]:
    M[emoji] = ("", "REVIEW")

# sky & weather
SKY = {
    "🌑": ("cycle", "new moon starts the cycle; cycle repeats in phases"),
    "🌒": ("growth", "waxing crescent grows brighter; growth is increasing over time"),
    "🌓": ("balance", "half moon splits light and dark; balance is equal halves"),
    "🌔": ("growth", "waxing gibbous nearly full; growth is increasing over time"),
    "🌕": ("peak", "full moon at maximum light; peak is the highest point"),
    "🌖": ("decline", "waning gibbous loses light; decline is decreasing over time"),
    "🌗": ("balance", "half moon splits light and dark; balance is equal halves"),
    "🌘": ("decline", "waning crescent fades away; decline is decreasing over time"),
    "🌙": ("cycle", "crescent moon marks a phase; cycle repeats in phases"),
    "🌚": ("personality", "moon with a face seems alive; personality is a living character"),
    "🌛": ("night", "crescent moon hangs at night; night is the dark half of day"),
    "🌜": ("night", "crescent moon hangs at night; night is the dark half of day"),
    "🌡️": ("fever", "thermometer measures heat; fever is overheated intensity"),
    "☀️": ("energy", "sun radiates light and warmth; energy is active power"),
    "🌝": ("brightness", "full moon face glows at night; brightness is vivid light"),
    "🌞": ("radiance", "sun with a face beams outward; radiance is shining outward"),
    "🪐": ("grandeur", "ringed planet looms vast in space; grandeur is impressive scale"),
    "⭐": ("excellence", "star stands out in the sky; excellence is standing out"),
    "🌟": ("brilliance", "glowing star shines brighter; brilliance is vivid brightness"),
    "✨": ("magic", "sparkles mark something special; magic is extraordinary wonder"),
    "⚡": ("insight", "lightning flashes in an instant; insight is a sudden flash"),
    "☄️": ("rarity", "comet appears once in ages; rarity is seldom seen"),
    "💥": ("impact", "collision bursts on contact; impact is forceful contact"),
    "🔥": ("passion", "fire burns hot and bright; passion is intense feeling"),
    "🌪️": ("turmoil", "tornado tears through order; turmoil is violent disorder"),
    "🌈": ("hope", "rainbow follows the storm; hope follows hardship"),
    "☁️": ("doubt", "clouds block the clear sky; doubt blocks what is clear"),
    "⛅": ("mixed", "sun and cloud share the sky; mixed is partly one partly another"),
    "⛈️": ("turmoil", "storm brings thunder and rain; turmoil is violent disorder"),
    "🌤️": ("optimism", "sun peeks through clouds; optimism sees light ahead"),
    "🌥️": ("caution", "sun behind heavy cloud; caution is holding back"),
    "🌦️": ("contrast", "sun shines while rain falls; contrast is opposites together"),
    "🌧️": ("sorrow", "rain falls like tears; sorrow is quiet sadness"),
    "🌨️": ("stillness", "snow quiets the landscape; stillness is calm quiet"),
    "🌩️": ("danger", "lightning strikes from the cloud; danger is imminent threat"),
    "🌫️": ("confusion", "fog blurs what is near; confusion blurs what is clear"),
    "🌬️": ("change", "wind shifts direction freely; change shifts how things go"),
    "💨": ("haste", "dash of wind moves fast; haste is moving quickly"),
    "💧": ("beginning", "one droplet starts the flow; beginning is a small start"),
    "💦": ("effort", "sweat drops show hard work; effort is work that costs you"),
    "☂️": ("protection", "umbrella shields from rain; protection shields from harm"),
    "☔": ("protection", "umbrella in rain shields you; protection shields from harm"),
    "☃️": ("temporary", "snowman melts when warmth returns; temporary does not last"),
    "⛄": ("temporary", "snowman melts when warmth returns; temporary does not last"),
}
M.update(SKY)

# event
EVENT = {
    "🎃": ("disguise", "jack-o-lantern hides a carved face; disguise hides true identity"),
    "🎄": ("tradition", "christmas tree marks yearly ritual; tradition is repeated custom"),
    "🎆": ("celebration", "fireworks burst for festivity; celebration is joyful observance"),
    "🎇": ("celebration", "sparkler lights a festive night; celebration is joyful observance"),
    "🧨": ("surprise", "firecracker pops without warning; surprise is sudden unexpected"),
    "🎈": ("festivity", "balloon lifts a party mood; festivity is lighthearted joy"),
    "🎉": ("celebration", "party popper marks a fest; celebration is joyful observance"),
    "🎊": ("triumph", "confetti rains on victory; triumph is winning celebration"),
    "🎋": ("wish", "tanabata tree holds written hopes; wish is hoped-for outcome"),
    "🎍": ("decoration", "pine decoration marks the season; decoration adorns an occasion"),
    "🎎": ("heritage", "dolls display cultural tradition; heritage is passed-down culture"),
    "🎏": ("aspiration", "carp streamer swims upward; aspiration is striving upward"),
    "🎐": ("reminder", "wind chime rings with each breeze; reminder brings thought back"),
    "🎑": ("reflection", "moon viewing invites quiet gaze; reflection is thoughtful looking"),
    "🧧": ("blessing", "red envelope carries good wishes; blessing is wished well-being"),
    "🎀": ("decoration", "ribbon ties a gift prettily; decoration adorns an occasion"),
    "🎁": ("generosity", "gift is given to another; generosity is giving freely"),
    "🎗️": ("reminder", "awareness ribbon marks a cause; reminder brings thought back"),
    "🎟️": ("admission", "ticket grants entry inside; admission is being let in"),
    "🎫": ("admission", "ticket grants entry inside; admission is being let in"),
    "🎖️": ("honor", "medal marks distinguished service; honor is earned respect"),
    "🏆": ("victory", "trophy goes to the winner; victory is winning the contest"),
    "🏅": ("achievement", "medal marks accomplished feat; achievement is reaching a goal"),
    "🥇": ("first", "gold medal marks top place; first is leading all others"),
    "🥈": ("second", "silver medal marks runner-up; second is next after first"),
    "🥉": ("third", "bronze medal marks third place; third is after second"),
}
M.update(EVENT)

# sport
SPORT = {
    "⚽": ("teamwork", "soccer needs players together; teamwork is acting together"),
    "🏀": ("competition", "basketball contests for the hoop; competition is striving to win"),
    "🏈": ("strategy", "football plans each play; strategy is planned action"),
    "⚾": ("tradition", "baseball follows timeless rules; tradition is repeated custom"),
    "🥎": ("adaptation", "softball is baseball made gentler; adaptation is adjusting the form"),
    "🎾": ("rally", "tennis exchanges shot for shot; rally is back-and-forth exchange"),
    "🏐": ("cooperation", "volleyball keeps the ball aloft together; cooperation is joint effort"),
    "🏉": ("perseverance", "rugby pushes through contact; perseverance is pushing through"),
    "🥏": ("cooperation", "frisbee passes between players; cooperation is joint effort"),
    "🎳": ("precision", "bowling needs an exact line; precision is exact aim"),
    "🏏": ("patience", "cricket waits for the right ball; patience is waiting for timing"),
    "🏑": ("agility", "field hockey shifts fast on turf; agility is quick nimble motion"),
    "🏒": ("intensity", "hockey moves at fierce speed; intensity is fierce force"),
    "🥍": ("agility", "lacrosse weaves with quick passes; agility is quick nimble motion"),
    "🏓": ("reflex", "ping pong demands instant return; reflex is instant response"),
    "🏸": ("reflex", "badminton returns a fast shuttle; reflex is instant response"),
    "🥊": ("conflict", "boxing trades forceful blows; conflict is forceful opposition"),
    "🥋": ("discipline", "martial arts train controlled skill; discipline is controlled practice"),
    "🥅": ("objective", "goal net is what you aim for; objective is the target aim"),
    "⛳": ("precision", "golf needs an exact stroke; precision is exact aim"),
    "⛸️": ("grace", "skating glides with smooth motion; grace is smooth controlled beauty"),
    "🎣": ("patience", "fishing waits for the bite; patience is waiting for timing"),
    "🤿": ("exploration", "diving probes beneath the surface; exploration is seeking the unknown"),
    "🎿": ("thrill", "skiing races down the slope; thrill is exciting rush"),
    "🛷": ("thrill", "sled speeds down the hill; thrill is exciting rush"),
    "🥌": ("strategy", "curling places each stone with care; strategy is planned action"),
    "🎯": ("precision", "dart board demands exact aim; precision is exact aim"),
    "🪀": ("persistence", "yo-yo returns when you pull; persistence is coming back again"),
    "🪁": ("aspiration", "kite rises on the wind; aspiration is striving upward"),
}
M.update(SPORT)

# game
GAME = {
    "🎱": ("strategy", "pool plans each shot ahead; strategy is planned action"),
    "🔮": ("foresight", "crystal ball sees what may come; foresight is seeing ahead"),
    "🪄": ("shortcut", "magic wand fixes in one wave; shortcut is bypassing hard work"),
    "🎮": ("escapism", "video game enters another world; escapism is leaving the real"),
    "🕹️": ("control", "joystick steers the action; control is directing what happens"),
    "🎰": ("gamble", "slot machine bets on chance; gamble is risking on chance"),
    "🎲": ("chance", "dice land on random faces; chance is unpredictable outcome"),
    "🧩": ("problem", "puzzle pieces must fit together; problem is something to solve"),
    "🧸": ("comfort", "teddy bear soothes a child; comfort is soothing ease"),
    "🪅": ("surprise", "pinata bursts with hidden treats; surprise is sudden unexpected"),
    "🪩": ("festivity", "mirror ball lights the dance floor; festivity is lighthearted joy"),
    "🪆": ("layers", "nesting dolls hide within each other; layers are levels within levels"),
    "♠️": ("suit", "spade is one card suit; suit is a matched category"),
    "♥️": ("suit", "heart is one card suit; suit is a matched category"),
    "♦️": ("suit", "diamond is one card suit; suit is a matched category"),
    "♣️": ("suit", "club is one card suit; suit is a matched category"),
    "♟️": ("sacrifice", "pawn is traded in chess strategy; sacrifice is giving up for gain"),
    "🃏": ("wildcard", "joker can be anything needed; wildcard is unpredictable factor"),
    "🀄": ("tradition", "mahjong carries old game culture; tradition is repeated custom"),
    "🎴": ("tradition", "flower cards carry old game culture; tradition is repeated custom"),
    "🎭": ("pretense", "theater masks hide the actor; pretense is playing a role"),
    "🖼️": ("display", "framed picture shows for viewing; display is shown for others"),
    "🎨": ("creativity", "palette holds colors to create; creativity is making something new"),
    "🧵": ("connection", "thread stitches pieces together; connection links separate parts"),
    "🪡": ("repair", "needle mends torn fabric; repair is fixing what is broken"),
    "🧶": ("patience", "yarn is worked stitch by stitch; patience is steady careful work"),
    "🪢": ("bond", "knot ties two ends together; bond is holding fast together"),
}
M.update(GAME)

# clothing
CLOTHING = {
    "👓": ("clarity", "glasses sharpen what you see; clarity is seeing clearly"),
    "🕶️": ("cool", "sunglasses hide the eyes; cool is calm unbothered style"),
    "🥽": ("protection", "goggles shield the eyes; protection shields from harm"),
    "🥼": ("expertise", "lab coat marks scientific work; expertise is specialized knowledge"),
    "🦺": ("safety", "safety vest warns of hazard; safety is kept from harm"),
    "👔": ("formality", "necktie marks formal dress; formality is proper official manner"),
    "👕": ("casual", "shirt is everyday wear; casual is relaxed informal"),
    "👖": ("casual", "jeans are everyday wear; casual is relaxed informal"),
    "🧣": ("warmth", "scarf wraps against the cold; warmth is comforting heat"),
    "🧤": ("protection", "gloves shield the hands; protection shields from harm"),
    "🧥": ("shelter", "coat wraps against the weather; shelter is cover from elements"),
    "🧦": ("comfort", "socks cushion every step; comfort is physical ease"),
    "👗": ("elegance", "dress is worn for occasion; elegance is refined grace"),
    "👘": ("heritage", "kimono carries traditional form; heritage is passed-down culture"),
    "🥻": ("heritage", "sari carries traditional form; heritage is passed-down culture"),
    "🩱": ("exposure", "swimsuit reveals for water; exposure is being laid open"),
    "🩲": ("intimacy", "underwear stays closest to skin; intimacy is close private bond"),
    "🩳": ("casual", "shorts are relaxed summer wear; casual is relaxed informal"),
    "👙": ("allure", "bikini draws the eye; allure is attractive appeal"),
    "👚": ("casual", "blouse is everyday wear; casual is relaxed informal"),
    "👛": ("savings", "purse holds small valuables; savings is kept resources"),
    "👜": ("carry", "handbag carries daily needs; carry is bearing what you need"),
    "👝": ("carry", "clutch carries essentials close; carry is bearing what you need"),
    "🛍️": ("consumption", "shopping bags fill with purchases; consumption is taking things in"),
    "🎒": ("preparation", "backpack holds what you need ahead; preparation is readying beforehand"),
    "🩴": ("casual", "sandal is light easy footwear; casual is relaxed informal"),
    "👞": ("formality", "dress shoe marks formal step; formality is proper official manner"),
    "👟": ("activity", "sneaker is built for movement; activity is active motion"),
    "🥾": ("endurance", "boot treads rough terrain; endurance is lasting through hardship"),
    "🥿": ("comfort", "flat shoe eases every step; comfort is physical ease"),
    "👠": ("allure", "heel lifts and shapes the step; allure is attractive appeal"),
    "👡": ("casual", "sandal is light easy footwear; casual is relaxed informal"),
    "🩰": ("grace", "ballet shoe enables fluid dance; grace is smooth controlled beauty"),
    "👢": ("endurance", "boot treads rough terrain; endurance is lasting through hardship"),
    "👑": ("sovereignty", "crown marks the ruler; sovereignty is supreme authority"),
    "👒": ("shade", "hat shields from sun above; shade is shelter from harshness"),
    "🎩": ("formality", "top hat marks formal dress; formality is proper official manner"),
    "🎓": ("achievement", "grad cap marks completed study; achievement is reaching a goal"),
    "🧢": ("casual", "cap is everyday headwear; casual is relaxed informal"),
    "🪖": ("defense", "helmet guards the head in battle; defense is guarding against harm"),
    "⛑️": ("rescue", "rescue helmet marks emergency aid; rescue is saving from harm"),
    "📿": ("devotion", "prayer beads mark repeated prayer; devotion is committed reverence"),
    "💄": ("appearance", "lipstick colors the lips; appearance is how you present"),
    "💍": ("commitment", "ring marks a binding promise; commitment is a binding promise"),
    "💎": ("value", "gem is rare and precious; value is worth holding dear"),
}
M.update(CLOTHING)

# sound
SOUND = {
    "🔇": ("suppression", "mute silences all sound; suppression is holding back expression"),
    "🔈": ("volume", "quiet speaker plays low; volume is level of sound"),
    "🔉": ("volume", "medium speaker plays louder; volume is level of sound"),
    "🔊": ("amplification", "loud speaker fills the room; amplification is making louder"),
    "📢": ("announcement", "megaphone broadcasts to the crowd; announcement is public declaration"),
    "📣": ("announcement", "megaphone broadcasts to the crowd; announcement is public declaration"),
    "📯": ("summons", "horn calls people to gather; summons is calling to come"),
    "🔔": ("alert", "bell rings to warn or call; alert is warning attention"),
    "🔕": ("silence", "bell with slash means no sound; silence is absence of noise"),
}
M.update(SOUND)

# music
MUSIC = {
    "🎼": ("composition", "score arranges notes on lines; composition is arranged creation"),
    "🎵": ("melody", "note carries a musical line; melody is tuneful line"),
    "🎶": ("harmony", "notes together make music; harmony is parts fitting together"),
    "🎙️": ("broadcast", "studio mic sends voice outward; broadcast is sending widely"),
    "🎚️": ("adjustment", "slider fine-tunes the level; adjustment is fine tuning"),
    "🎛️": ("control", "knobs adjust the sound mix; control is directing settings"),
    "🎤": ("performance", "mic carries a live voice; performance is presenting to others"),
    "🎧": ("immersion", "headphones seal you in sound; immersion is deep involvement"),
    "📻": ("broadcast", "radio sends sound through air; broadcast is sending widely"),
}
M.update(MUSIC)

# musical-instrument
INSTRUMENT = {
    "🎷": ("expression", "saxophone voices smoky tone; expression is outward feeling"),
    "🪗": ("nostalgia", "accordion squeezes old-world song; nostalgia is longing for past"),
    "🎸": ("rebellion", "guitar drives raw loud sound; rebellion is breaking from norms"),
    "🎹": ("precision", "piano needs exact finger keys; precision is exact aim"),
    "🥁": ("rhythm", "drum sets the beat for all; rhythm is steady repeating pulse"),
    "🪘": ("rhythm", "long drum sets a steady beat; rhythm is steady repeating pulse"),
    "🎺": ("fanfare", "trumpet announces with bold blast; fanfare is bold announcement"),
    "🎻": ("elegance", "violin sings with refined tone; elegance is refined grace"),
    "🪕": ("folksy", "banjo plucks rustic melody; folksy is plain homely character"),
}
M.update(INSTRUMENT)

# light & video
LIGHT = {
    "🎬": ("production", "clapper marks a filmed take; production is making output"),
    "🎥": ("capture", "movie camera records the scene; capture is holding a moment"),
    "📽️": ("projection", "projector throws image on screen; projection is showing outward"),
    "🎞️": ("sequence", "film strip holds frames in order; sequence is ordered series"),
    "📺": ("broadcast", "tv sends shows into homes; broadcast is sending widely"),
    "📷": ("capture", "camera freezes a moment in light; capture is holding a moment"),
    "📸": ("capture", "camera flash freezes the instant; capture is holding a moment"),
    "📹": ("recording", "camcorder tapes moving scenes; recording is preserving over time"),
    "📼": ("archive", "vhs tape stores old footage; archive is stored past record"),
}
M.update(LIGHT)

# tool
TOOL = {
    "🔍": ("scrutiny", "magnifier enlarges small detail; scrutiny is close examination"),
    "🔎": ("scrutiny", "magnifier enlarges small detail; scrutiny is close examination"),
    "🕯️": ("ambience", "candle gives soft warm light; ambience is surrounding mood"),
    "💡": ("insight", "bulb lights when idea clicks; insight is a sudden flash"),
    "🔦": ("revelation", "flashlight reveals what was dark; revelation is making known"),
    "🏮": ("guidance", "lantern lights the path ahead; guidance is showing the way"),
    "🪔": ("devotion", "diya lamp marks sacred light; devotion is committed reverence"),
    "🧯": ("containment", "extinguisher stops spreading fire; containment is holding in bounds"),
    "🛢️": ("reserve", "oil drum stores bulk supply; reserve is stored supply"),
    "🔨": ("force", "hammer drives with blunt force; force is direct strong power"),
    "🪓": ("severance", "axe cuts through wood; severance is cutting apart"),
    "⛏️": ("excavation", "pick digs into hard ground; excavation is digging deep"),
    "⚒️": ("labor", "hammer and pick break hard stone; labor is hard physical work"),
    "🛠️": ("repair", "tools fix what is broken; repair is fixing what is broken"),
    "🗡️": ("threat", "dagger is close and dangerous; threat is danger nearby"),
    "⚔️": ("conflict", "crossed swords mark battle; conflict is forceful opposition"),
    "💣": ("danger", "bomb can destroy on detonation; danger is imminent threat"),
    "🪃": ("return", "boomerang curves back to thrower; return is coming back again"),
    "🏹": ("aim", "bow sends arrow to target; aim is directing toward target"),
    "🛡️": ("defense", "shield blocks incoming blows; defense is guarding against harm"),
    "🪚": ("division", "saw cuts material apart; division is splitting into parts"),
    "🔧": ("adjustment", "wrench tightens or loosens fit; adjustment is fine tuning"),
    "🪛": ("assembly", "screwdriver joins parts together; assembly is putting together"),
    "🗜️": ("pressure", "clamp squeezes with steady force; pressure is squeezing force"),
    "⚖️": ("justice", "scales weigh both sides equally; justice is fair balance"),
    "🦯": ("guidance", "white cane guides blind steps; guidance is showing the way"),
    "🔗": ("connection", "link joins two chains together; connection links separate parts"),
    "⛓️": ("bondage", "chains bind and restrict movement; bondage is being held fast"),
    "🪝": ("catch", "hook snags and holds fast; catch is seizing and holding"),
    "🧰": ("readiness", "toolbox holds gear for the job; readiness is prepared for task"),
    "🧲": ("attraction", "magnet pulls metal toward it; attraction is pulling toward"),
    "🪜": ("advancement", "ladder climbs step by step; advancement is rising by stages"),
}
M.update(TOOL)

# money
MONEY = {
    "💸": ("waste", "money flies away with wings; waste is losing what you had"),
    "💵": ("value", "dollar bill holds spending power; value is worth exchanged"),
    "💴": ("value", "yen note holds spending power; value is worth exchanged"),
    "💶": ("value", "euro note holds spending power; value is worth exchanged"),
    "💷": ("value", "pound note holds spending power; value is worth exchanged"),
    "🪙": ("token", "coin is small portable value; token is small stand-in value"),
    "💰": ("wealth", "money bag holds accumulated coins; wealth is accumulated resources"),
    "💳": ("credit", "card borrows now and pays later; credit is trust to pay later"),
    "🧾": ("proof", "receipt proves the transaction; proof is evidence of fact"),
    "💹": ("trend", "chart shows market direction; trend is direction over time"),
}
M.update(MONEY)

# mail
MAIL = {
    "✉️": ("message", "envelope carries written words; message is communicated content"),
    "📧": ("message", "email sends words instantly; message is communicated content"),
    "📨": ("arrival", "incoming mail just arrived; arrival is reaching the end"),
    "📩": ("affection", "love letter carries tender words; affection is tender feeling"),
    "📤": ("outgoing", "outbox holds mail to send; outgoing is leaving your hands"),
    "📥": ("incoming", "inbox holds mail received; incoming is arriving to you"),
    "📦": ("bundle", "package wraps items together; bundle is items grouped together"),
    "📫": ("reception", "closed mailbox holds delivered mail; reception is receiving inward"),
    "📪": ("reception", "mailbox holds delivered mail; reception is receiving inward"),
    "📬": ("reception", "open mailbox shows new mail; reception is receiving inward"),
    "📭": ("emptiness", "empty mailbox has nothing inside; emptiness is having nothing"),
    "📮": ("dispatch", "postbox sends mail on its way; dispatch is sending outward"),
    "🗳️": ("choice", "ballot records your vote; choice is selecting among options"),
}
M.update(MAIL)

# writing
WRITING = {
    "✏️": ("draft", "pencil marks can be erased; draft is tentative first version"),
    "✒️": ("commitment", "ink pen marks are lasting; commitment is a binding promise"),
    "🖋️": ("commitment", "fountain pen lays lasting ink; commitment is a binding promise"),
    "🖊️": ("commitment", "pen ink stays on the page; commitment is a binding promise"),
    "🖌️": ("artistry", "brush paints with flowing strokes; artistry is skilled creative work"),
    "🖍️": ("boldness", "crayon marks with thick color; boldness is strong visible stroke"),
    "📝": ("reminder", "memo note jogs the memory; reminder brings thought back"),
}
M.update(WRITING)

# office
OFFICE = {
    "💼": ("business", "briefcase carries work affairs; business is commercial affairs"),
    "📁": ("organization", "folder groups related papers; organization is orderly grouping"),
    "📂": ("organization", "open folder reveals grouped files; organization is orderly grouping"),
    "🗂️": ("organization", "dividers sort papers by section; organization is orderly grouping"),
    "📅": ("schedule", "calendar marks planned dates; schedule is planned timing"),
    "📆": ("schedule", "tear-off calendar marks each day; schedule is planned timing"),
    "🗒️": ("reminder", "notepad catches quick notes; reminder brings thought back"),
    "🗓️": ("schedule", "spiral calendar plans the month; schedule is planned timing"),
    "📇": ("index", "card index sorts for lookup; index is sorted reference"),
    "📈": ("growth", "chart line rises upward; growth is increasing over time"),
    "📉": ("decline", "chart line falls downward; decline is decreasing over time"),
    "📊": ("analysis", "bar chart compares quantities; analysis is examining data"),
    "📋": ("accountability", "clipboard tracks tasks to do; accountability is answerable tracking"),
    "📌": ("highlight", "pin marks an important spot; highlight is marking as important"),
    "📍": ("location", "pin drops on exact place; location is exact position"),
    "📎": ("attachment", "paperclip holds sheets together; attachment is joined addition"),
    "🖇️": ("attachment", "linked clips hold papers together; attachment is joined addition"),
    "📏": ("measurement", "ruler measures exact length; measurement is precise tracking"),
    "📐": ("precision", "set square marks exact angles; precision is exact aim"),
    "✂️": ("separation", "scissors cut material apart; separation is dividing apart"),
    "🗃️": ("archive", "file box stores old records; archive is stored past record"),
    "🗄️": ("storage", "cabinet stores files inside; storage is kept for later"),
    "🗑️": ("discard", "trash bin holds what is thrown; discard is getting rid of"),
}
M.update(OFFICE)

# lock
LOCK = {
    "🔒": ("restriction", "lock keeps the door shut; restriction is holding back access"),
    "🔓": ("access", "unlock opens what was shut; access is ability to enter"),
    "🔏": ("privacy", "lock with pen marks private entry; privacy is kept from others"),
    "🔐": ("security", "locked with key is secured shut; security is kept safe"),
    "🔑": ("solution", "key opens what was locked; solution is what unlocks the problem"),
    "🗝️": ("solution", "old key opens a hidden lock; solution is what unlocks the problem"),
}
M.update(LOCK)

# science
SCIENCE = {
    "⚗️": ("transformation", "alembic distills and transforms; transformation is changing form"),
    "🧪": ("experiment", "test tube tries a small sample; experiment is testing a hypothesis"),
    "🧫": ("cultivation", "petri dish grows a culture; cultivation is growing and tending"),
    "🧬": ("identity", "dna codes who you are; identity is what makes you you"),
    "🔬": ("scrutiny", "microscope reveals tiny detail; scrutiny is close examination"),
    "🔭": ("foresight", "telescope sees far beyond sight; foresight is seeing ahead"),
    "📡": ("transmission", "satellite dish sends signals afar; transmission is sending across distance"),
}
M.update(SCIENCE)

# medical
MEDICAL = {
    "💉": ("injection", "syringe puts fluid into body; injection is forcing something in"),
    "🩸": ("vitality", "blood carries life through body; vitality is life force within"),
    "💊": ("remedy", "pill is swallowed to heal; remedy is fix for ailment"),
    "🩹": ("patch", "bandage covers a wound; patch is covering a weak spot"),
    "🩺": ("diagnosis", "stethoscope listens to the body; diagnosis is finding what is wrong"),
}
M.update(MEDICAL)

# household
HOUSEHOLD = {
    "🚪": ("opportunity", "door opens to what is beyond; opportunity is an opening ahead"),
    "🛏️": ("rest", "bed is for sleep and recovery; rest is recovery from effort"),
    "🛋️": ("comfort", "couch invites relaxed sitting; comfort is physical ease"),
    "🪑": ("position", "chair is where you take a seat; position is your assigned place"),
    "🚽": ("relief", "toilet gives bodily release; relief is easing of pressure"),
    "🪠": ("unblock", "plunger clears a clogged pipe; unblock is clearing obstruction"),
    "🚿": ("refresh", "shower washes away the day; refresh is restoring freshness"),
    "🛁": ("immersion", "tub surrounds you in water; immersion is deep involvement"),
    "🪤": ("trap", "mousetrap lures then snaps shut; trap is lure into confinement"),
    "🪒": ("precision", "razor cuts with a sharp edge; precision is exact aim"),
    "🧴": ("care", "lotion bottle tends the skin; care is tending with attention"),
    "🧷": ("fastening", "safety pin holds fabric together; fastening is holding together"),
    "🧹": ("cleanup", "broom sweeps dirt away; cleanup is clearing what clutters"),
    "🧺": ("gathering", "basket collects items together; gathering is bringing together"),
    "🧻": ("necessity", "toilet paper meets basic need; necessity is what must be had"),
    "🪣": ("collection", "bucket holds gathered liquid; collection is bringing together"),
    "🧼": ("cleanliness", "soap washes away grime; cleanliness is freedom from dirt"),
    "🫧": ("fragility", "bubbles pop with a touch; fragility is easily broken"),
    "🪥": ("hygiene", "toothbrush cleans each day; hygiene is healthful cleanliness"),
    "🧽": ("absorption", "sponge soaks up spilled liquid; absorption is taking in fully"),
    "🛒": ("consumption", "cart fills with goods to buy; consumption is taking things in"),
    "🚬": ("habit", "cigarette is repeated addictive draw; habit is repeated hard-to-break act"),
    "⚰️": ("end", "coffin holds the deceased; end is final conclusion"),
    "🪦": ("legacy", "headstone marks a life remembered; legacy is what remains after"),
    "⚱️": ("remembrance", "urn holds ashes of the dead; remembrance is keeping in memory"),
    "🗿": ("stoicism", "moai face stares unmoving for ages; stoicism is unmoved endurance"),
    "🪧": ("protest", "placard carries a public message; protest is public objection"),
}
M.update(HOUSEHOLD)

# sign
SIGN = {
    "🏧": ("withdrawal", "atm gives cash on demand; withdrawal is taking out stored value"),
    "🚮": ("disposal", "litter bin marks where trash goes; disposal is getting rid of"),
    "🚰": ("provision", "potable water sign marks safe drink; provision is supplying what is needed"),
    "♿": ("accessibility", "wheelchair sign marks equal access; accessibility is equal access"),
    "🚹": ("designation", "mens room sign marks who may enter; designation is marked category"),
    "🚺": ("designation", "womens room sign marks who may enter; designation is marked category"),
    "🚻": ("designation", "restroom sign marks facility type; designation is marked category"),
    "🚼": ("care", "baby change sign marks infant care; care is tending with attention"),
    "🚾": ("designation", "restroom sign marks facility type; designation is marked category"),
    "🛂": ("verification", "passport control checks identity; verification is confirming truth"),
    "🛃": ("inspection", "customs inspects what crosses border; inspection is close checking"),
    "🛄": ("reclaim", "baggage claim retrieves what was stored; reclaim is getting back what is yours"),
    "🛅": ("storage", "left luggage holds bags for later; storage is kept for later"),
    "⚠️": ("caution", "warning sign alerts to danger; caution is careful awareness"),
    "🚸": ("vulnerability", "children crossing marks those at risk; vulnerability is easily harmed"),
    "⛔": ("forbidden", "no entry sign blocks the way; forbidden is not allowed"),
    "🚫": ("prohibition", "prohibited sign bans the action; prohibition is official ban"),
    "🚳": ("prohibition", "no bikes sign bans cycling here; prohibition is official ban"),
    "🚭": ("prohibition", "no smoking sign bans the act; prohibition is official ban"),
    "🚯": ("prohibition", "no litter sign bans dumping trash; prohibition is official ban"),
    "🚱": ("danger", "non-potable sign warns unsafe water; danger is imminent threat"),
    "🚷": ("prohibition", "no pedestrians sign bans walking here; prohibition is official ban"),
    "🔞": ("restriction", "no under 18 restricts by age; restriction is holding back access"),
    "☢️": ("danger", "radioactive sign warns toxic exposure; danger is imminent threat"),
    "☣️": ("danger", "biohazard sign warns lethal agent; danger is imminent threat"),
}
M.update(SIGN)

# arrow
ARROW = {
    "⬆️": ("rise", "up arrow points higher; rise is moving upward"),
    "↗️": ("growth", "up-right arrow rises and advances; growth is increasing over time"),
    "➡️": ("progress", "right arrow points forward; progress is moving ahead"),
    "↘️": ("decline", "down-right arrow falls and retreats; decline is decreasing over time"),
    "⬇️": ("fall", "down arrow points lower; fall is moving downward"),
    "↙️": ("retreat", "down-left arrow drops and pulls back; retreat is moving away back"),
    "⬅️": ("return", "left arrow points backward; return is going back again"),
    "↖️": ("withdrawal", "up-left arrow rises and pulls back; withdrawal is taking out or back"),
    "↕️": ("exchange", "up-down arrow moves both ways; exchange is swapping between sides"),
    "↔️": ("reciprocity", "left-right arrow goes both ways; reciprocity is mutual give and take"),
    "↩️": ("revert", "return arrow curves back left; revert is going back to before"),
    "↪️": ("redirect", "return arrow curves forward right; redirect is sending another way"),
    "⤴️": ("rise", "curved up arrow lifts upward; rise is moving upward"),
    "⤵️": ("fall", "curved down arrow drops downward; fall is moving downward"),
    "🔃": ("cycle", "reload arrows go in a circle; cycle repeats round and round"),
    "🔄": ("renewal", "arrows circle for a fresh start; renewal is fresh beginning"),
    "🔙": ("return", "back arrow returns to prior; return is going back again"),
    "🔚": ("end", "end arrow marks the finish; end is final conclusion"),
    "🔛": ("activation", "on arrow marks switched active; activation is turned on state"),
    "🔜": ("imminence", "soon arrow marks coming next; imminence is about to happen"),
    "🔝": ("peak", "top arrow marks highest point; peak is the highest point"),
}
M.update(ARROW)

# symbol
SYMBOL = {
    "🛐": ("devotion", "worship symbol marks sacred practice; devotion is committed reverence"),
    "⚛️": ("fundamental", "atom is basic building block; fundamental is core underlying part"),
    "🕉️": ("spirituality", "om symbol marks sacred sound; spirituality is inner sacred life"),
    "✡️": ("heritage", "star of david marks jewish identity; heritage is passed-down culture"),
    "☸️": ("cycle", "dharma wheel turns through life; cycle repeats round and round"),
    "☯️": ("balance", "yin yang holds opposing halves; balance is equal halves"),
    "✝️": ("sacrifice", "cross marks suffering borne; sacrifice is giving up for gain"),
    "☦️": ("faith", "orthodox cross marks belief; faith is trust in what is unseen"),
    "☪️": ("faith", "star and crescent mark islam; faith is trust in what is unseen"),
    "☮️": ("harmony", "peace symbol calls for calm; harmony is peaceful agreement"),
    "🕎": ("heritage", "menorah marks jewish tradition; heritage is passed-down culture"),
    "🔯": ("heritage", "six-point star marks identity; heritage is passed-down culture"),
    "♈": ("impulse", "aries charges as the first sign; impulse is sudden forward drive"),
    "♉": ("stability", "taurus stands firm and steady; stability is holding firm"),
    "♊": ("duality", "gemini twins mirror two sides; duality is two sides together"),
    "♋": ("protection", "cancer shelters like a shell; protection shields from harm"),
    "♌": ("pride", "leo shines like the lion; pride is confident self-regard"),
    "♍": ("precision", "virgo attends to fine detail; precision is exact aim"),
    "♎": ("balance", "libra scales weigh both sides; balance is equal halves"),
    "♏": ("intensity", "scorpio strikes with deep force; intensity is fierce force"),
    "♐": ("exploration", "sagittarius aims the arrow far; exploration is seeking the unknown"),
    "♑": ("ambition", "capricorn climbs the steep peak; ambition rises above the ordinary"),
    "♒": ("innovation", "aquarius pours new ideas forth; innovation is new way of doing"),
    "♓": ("empathy", "pisces flows with others feelings; empathy is feeling with another"),
    "⛎": ("healing", "ophiuchus holds the serpent of cure; healing is making whole again"),
}
M.update(SYMBOL)

# av-symbol
AV = {
    "🔀": ("randomness", "shuffle mixes order unpredictably; randomness is without fixed order"),
    "🔁": ("repetition", "repeat plays the same again; repetition is doing again"),
    "🔂": ("repetition", "repeat one loops a single track; repetition is doing again"),
    "▶️": ("start", "play button begins the action; start is setting in motion"),
    "⏩": ("haste", "fast forward skips ahead quickly; haste is moving quickly"),
    "⏭️": ("skip", "next track jumps past this one; skip is passing over current"),
    "⏯️": ("pause", "play pause toggles stop and go; pause is temporary halt"),
    "◀️": ("reverse", "reverse plays backward in time; reverse is going opposite direction"),
    "⏪": ("rewind", "rewind goes back to earlier; rewind is returning to before"),
    "⏮️": ("return", "previous track goes back one; return is going back again"),
    "🔼": ("rise", "up button moves higher; rise is moving upward"),
    "⏫": ("rise", "fast up jumps higher quickly; rise is moving upward"),
    "🔽": ("fall", "down button moves lower; fall is moving downward"),
    "⏬": ("fall", "fast down drops lower quickly; fall is moving downward"),
    "⏸️": ("pause", "pause halts what is playing; pause is temporary halt"),
    "⏹️": ("stop", "stop ends playback completely; stop is bringing to halt"),
    "⏺️": ("record", "record captures what happens now; record is preserving over time"),
    "⏏️": ("eject", "eject pushes media out; eject is forcing outward removal"),
    "🎦": ("cinema", "cinema mark means film showing; cinema is shared screen story"),
    "🔅": ("diminish", "dim lowers the brightness; diminish is making less"),
    "🔆": ("amplify", "bright raises the brightness; amplify is making louder or brighter"),
    "📶": ("connectivity", "signal bars show link strength; connectivity is being linked"),
    "📳": ("alert", "vibrate mode buzzes for notice; alert is warning attention"),
    "📴": ("disconnection", "phone off breaks the link; disconnection is link broken"),
    "♀️": ("feminine", "female symbol marks woman gender; feminine is woman-associated quality"),
    "♂️": ("masculine", "male symbol marks man gender; masculine is man-associated quality"),
    "⚧️": ("identity", "transgender symbol marks gender crossing; identity is what makes you you"),
    "✖️": ("negation", "multiply sign marks crossing out; negation is saying not so"),
    "➕": ("addition", "plus adds one thing to another; addition is joining more in"),
    "➖": ("subtraction", "minus takes one thing away; subtraction is taking away from"),
    "➗": ("division", "divide splits into equal parts; division is splitting into parts"),
    "♾️": ("endless", "infinity loop never closes an end; endless is without limit"),
    "‼️": ("emphasis", "double bang stresses the point; emphasis is extra force of meaning"),
    "⁉️": ("surprise", "exclamation question mixes shock and ask; surprise is sudden unexpected"),
    "❓": ("uncertainty", "question mark asks what is unknown; uncertainty is not yet known"),
    "❔": ("uncertainty", "outlined question asks what is unknown; uncertainty is not yet known"),
    "❕": ("emphasis", "exclamation marks strong feeling; emphasis is extra force of meaning"),
    "❗": ("emphasis", "bold exclamation stresses the point; emphasis is extra force of meaning"),
    "〰️": ("hesitation", "wavy dash trails off uncertainly; hesitation is holding back action"),
    "💱": ("exchange", "currency arrows swap one for another; exchange is swapping between sides"),
    "💲": ("cost", "heavy dollar sign marks price; cost is what must be paid"),
    "⚕️": ("healing", "medical staff marks care profession; healing is making whole again"),
    "♻️": ("reuse", "recycle arrows loop material back; reuse is using again"),
    "⚜️": ("nobility", "fleur de lis marks royal emblem; nobility is high honorable rank"),
    "🔱": ("power", "trident is weapon of the sea god; power is ability to rule"),
    "📛": ("identification", "name badge shows who you are; identification is naming who someone is"),
    "🔰": ("beginner", "shoshin mark means new learner; beginner is just starting out"),
    "⭕": ("inclusion", "hollow circle marks round boundary; inclusion is being inside the boundary"),
    "✅": ("approval", "check mark means yes correct; approval is accepted as right"),
    "☑️": ("approval", "checked box means selected yes; approval is accepted as right"),
    "✔️": ("approval", "heavy check means confirmed yes; approval is accepted as right"),
    "❌": ("rejection", "cross mark means no wrong; rejection is refused as wrong"),
    "❎": ("rejection", "crossed box means not selected; rejection is refused as wrong"),
    "➰": ("loop", "curly loop circles back on itself; loop is path returning to start"),
    "➿": ("loop", "double loop circles twice around; loop is path returning to start"),
    "〽️": ("interruption", "part alternation mark breaks the flow; interruption is breaking continuity"),
    "✳️": ("emphasis", "eight spoked star marks highlight; emphasis is extra force of meaning"),
    "✴️": ("emphasis", "eight pointed star marks highlight; emphasis is extra force of meaning"),
    "❇️": ("sparkle", "sparkle mark catches the eye; sparkle is brief bright flash"),
    "©️": ("ownership", "copyright marks legal control; ownership is legal right to control"),
    "®️": ("ownership", "registered mark claims brand right; ownership is legal right to control"),
    "™️": ("claim", "trademark claims brand identity; claim is asserting as yours"),
}
M.update(AV)

# Japanese / keycap av-symbols — mostly literal signage
JP_REVIEW = [
    "#️⃣", "*️⃣", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟",
    "🔠", "🔡", "🔢", "🔣", "🔤",
    "🅰️", "🆎", "🅱️", "🆑", "🆒", "🆓", "ℹ️", "🆔", "Ⓜ️", "🆕", "🆖", "🅾️", "🆗", "🅿️", "🆘", "🆙", "🆚",
    "🈁", "🈂️", "🈷️", "🈶", "🈯", "🉐", "🈹", "🈚", "🈲", "🉑", "🈸", "🈴", "🈳", "🈺", "🈵",
]
for e in JP_REVIEW:
    M[e] = ("", "REVIEW")

# geometric
GEO = {
    "🔴": ("danger", "red circle signals stop or alert; danger is imminent threat"),
    "🟠": ("caution", "orange circle warns take care; caution is careful awareness"),
    "🟡": ("caution", "yellow circle warns slow down; caution is careful awareness"),
    "🟢": ("permission", "green circle signals go ahead; permission is allowed to proceed"),
    "🔵": ("calm", "blue circle feels cool and still; calm is peaceful steadiness"),
    "🟣": ("royalty", "purple circle marks regal hue; royalty is high noble rank"),
    "🟤": ("earthiness", "brown circle is soil and wood; earthiness is plain grounded quality"),
    "⚫": ("void", "black circle is empty dark space; void is absence of content"),
    "⚪": ("blank", "white circle is open empty space; blank is without mark yet"),
    "🟥": ("danger", "red square signals stop or alert; danger is imminent threat"),
    "🟧": ("caution", "orange square warns take care; caution is careful awareness"),
    "🟨": ("caution", "yellow square warns slow down; caution is careful awareness"),
    "🟩": ("permission", "green square signals go ahead; permission is allowed to proceed"),
    "🟦": ("calm", "blue square feels cool and still; calm is peaceful steadiness"),
    "🟪": ("royalty", "purple square marks regal hue; royalty is high noble rank"),
    "🟫": ("earthiness", "brown square is soil and wood; earthiness is plain grounded quality"),
    "⬛": ("void", "black square is solid dark block; void is absence of content"),
    "⬜": ("blank", "white square is open empty block; blank is without mark yet"),
    "🔶": ("highlight", "orange diamond catches the eye; highlight is marking as important"),
    "🔷": ("highlight", "blue diamond catches the eye; highlight is marking as important"),
    "🔸": ("highlight", "small orange diamond marks a point; highlight is marking as important"),
    "🔹": ("highlight", "small blue diamond marks a point; highlight is marking as important"),
    "🔺": ("rise", "up triangle points to the top; rise is moving upward"),
    "🔻": ("fall", "down triangle points to the bottom; fall is moving downward"),
    "💠": ("precision", "diamond dot marks exact point; precision is exact aim"),
    "🔘": ("selection", "radio button marks one chosen; selection is picking one option"),
}
M.update(GEO)

# subdivision flags
SUBDIVISION = {
    "🏴󠁧󠁢󠁥󠁮󠁧󠁿": ("community", "region is the place; community is the people"),
    "🏴󠁧󠁢󠁳󠁣󠁴󠁿": ("community", "region is the place; community is the people"),
    "🏴󠁧󠁢󠁷󠁬󠁳󠁿": ("community", "region is the place; community is the people"),
}
M.update(SUBDIVISION)

# duplicate household extinguisher
M["🧯"] = ("containment", "extinguisher stops spreading fire; containment is holding in bounds")

out = {emoji: {"metaphorical": meta, "mnemonic": mnem} for emoji, (meta, mnem) in M.items()}


def main() -> None:
    path = ROOT / "data" / "phase5-metaphor-mnemonic-batch.json"
    with path.open("w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Wrote {len(out)} entries to {path}")


if __name__ == "__main__":
    main()
