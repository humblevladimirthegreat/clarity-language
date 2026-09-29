# Syntax test corpus

Editors only — not linked from grammar pages. Working sheet for Phase 2a of the expressiveness review (`docs/proposals/expressiveness-review.md`).

Source: *Conlang Syntax Test Cases* (218 sentences culled from *1200 Graded Sentences for Analysis*), originally on fiziwig.com, mirrored at <https://cofl.github.io/conlang/resources/mirror/conlang-syntax-test-cases.html>. Numbering follows the source list; cite rows as `STC-nn`. English is copied verbatim, including the source's typos.

## When a sentence will not translate as is

Translate with published grammar and lexicon. When a sentence cannot be said, sort the blocker into one of three kinds:

| Blocker | Action |
|---------|--------|
| **Parser miss**: the docs already imply the reading, but the parser rejects or misreads it | Fix the parser, add a test, and list the fix under **Parser fixes** in [syntax-test-results](syntax-test-results.md). If the fix adds a construction, add one example on its anchor page. |
| **Grammar gap**: no taught form says it, or the docs leave the reading undecided | Do not invent or apply new grammar. Log a `G-nn` row in [syntax-test-results](syntax-test-results.md) with the current route, a recommendation, and a priority. The language owner decides it explicitly. Translate with the best existing route meanwhile, and mark the row **awkward (G-nn)**. |
| **Missing vocabulary**: the grammar works, but no root fits | Generate the vocabulary: add a lexicon row, or role English on an existing row (`npm run lint:lexicon`, then `npm run build`). Record it as an `L-nn` row. Use a stand-in only until the row exists. |

Every Agazan line below was checked with `node scripts/parse.mjs`. `SELFn` is the reader-as-speaker slot ([house cast](grammar-docs.md#house-cast)).

## Translations

| STC | English | Agazan | Morph gloss | Verdict |
|-----|---------|--------|-------------|---------|
| 1 | The sun shines. | `zazahor vabawel.` | z-←sun.full \| v-shine | covered |
| 2 | The sun is shining. | `zazahor thodum vabawel.` | z-←sun.full \| th-LIVE \| v-shine | covered |
| 3 | The sun shone. | `zazahor thunom vabawel.` | z-←sun.full \| th-WITNESSED \| v-shine | covered |
| 4 | The sun will shine. | `zazahor thabem bral vabawel.` | z-←sun.full \| [th-PATTERN \| b-later] \| v-shine | covered |
| 5 | The sun has been shining. | `zazahor thodum hagem vabawel.` | z-←sun.full \| th-LIVE \| h-still \| v-shine | covered |
| 6 | The sun is shining again. | `zazahor thodum herebem vabawel.` | z-←sun.full \| th-LIVE \| h-again \| v-shine | covered |
| 7 | The sun will shine tomorrow. | `zazahor thabem bazazam grawol vabawel.` | z-←sun.full \| [th-PATTERN \| [b-day \| g-one]] \| v-shine | covered |
| 8 | The sun shines brightly. | `zazahor habawel vabawel.` | z-←sun.full \| h-bright \| v-shine | covered |
| 9 | The bright sun shines. | `zazahor gabawel vabawel.` | [z-←sun.full \| g-bright] \| v-shine | covered |
| 10 | The sun is rising now. | `zazahor thodum vabaham.` | z-←sun.full \| th-LIVE \| v-rise | covered |
| 11 | All the people shouted. | `zual gebezal thunom valudel.` | [z-everything \| g-person] \| th-WITNESSED \| v-shout | covered |
| 12 | Some of the people shouted. | `zebezarx gram thunom valudel.` | [z-←person.full-x \| g-more-than-one.about] \| th-WITNESSED \| v-shout | covered |
| 13 | Many of the people shouted twice. | `zebezarx zahen zel gral thunom valudel hradul.` | [z-←person.full-x \| z-Typical \| z-rank/more \| g-amount] \| th-WITNESSED \| v-shout \| h-two | covered |
| 14 | Happy people often shout. | `zebezalx gegevam zahen zel hral valudel.` | [[z-person-x \| g-delight] \| z-Typical \| z-rank/more \| h-how-often] \| v-shout | by design (G-01) |
| 15 | The kitten jumped up. | `zebebexagadar thunom vagugel habaham.` | z-baby-x-cat \| th-WITNESSED \| v-jump \| h-rise | covered |
| 16 | The kitten jumped onto the table. | `zebebexagadar thunom vagugel aol bexagudel.` | z-baby-x-cat \| th-WITNESSED \| v-jump \| [on \| b-scene-x-cutlery] | covered |
| 17 | My little kitten walked away. | `glamazam zebebexagadal em bamegun thunom vowogalum.` | [gl-small \| z-baby-x-cat] \| [used-by \| b-speaker] \| th-WITNESSED \| v-recede | covered |
| 18 | It's raining. | `thodum verehel.` | th-LIVE \| v-rain | covered |
| 19 | The rain came down. | `zerehel thunom vadahel.` | z-rain \| th-WITNESSED \| v-fall | covered |
| 20 | The kitten is playing in the rain. | `zebebexagadar thodum vebogam am berehel.` | z-baby-x-cat \| th-LIVE \| v-play \| [amid \| b-rain] | covered |
| 21 | The rain has stopped. | `thodum hewem verehel.` | th-LIVE \| h-no-longer \| v-rain | covered |
| 22 | Soon the rain will stop. | `thevem brabum hewem verehel.` | [th-INFERRED \| b-+-e-.about] \| h-no-longer \| v-rain | covered |
| 23 | I hope the rain stops soon. | `thevegem thevem brabum hewem verehel.` | th-hope \| [th-INFERRED \| b-+-e-.about] \| h-no-longer \| v-rain | covered |
| 24 | Once wild animals lived here. | `zelebelx gelebem om bamegun thunem vahazam.` | [z-leopard-x \| g-nature] \| [near \| b-speaker] \| th-FORMER \| v-home | covered |
| 25 | Slowly she looked around. | `hezehom zalahen thunom vazahem ol bual.` | h-slow \| z-Alahen \| th-WITNESSED \| v-look \| [at \| b-everything] | covered |
| 26 | Go away! | `yel vuvudelum.` | y-command \| v-go-recede | covered |
| 27 | Let's go! | `yem zohan vuvudel.` | y-request \| z-interlocutors \| v-go | covered |
| 28 | You should go. | `zehodon vuvudel thugethem.` | z-listener \| v-go \| th-sake-ought-offered | covered |
| 29 | I will be happy to go. | `zSELFn thumam vuvudel thozuthamam.` | z-SELF \| th-plan-itinerary \| v-go \| th-pleasure-met-any-term-INTERNAL-FLOWING | covered |
| 30 | He will arrive soon. | `zazawan thevem brabum vevahal.` | z-Azawan \| [th-INFERRED \| b-+-e-.about] \| v-arrival | covered |
| 31 | The baby's ball has rolled away. | `zabezol em bebebel thamom vewawelum.` | z-ball \| [used-by \| b-baby] \| th-RESIDUE \| v-wheel-recede | covered |
| 32 | The two boys are working together. | `zobohalx gradul thodum vazewemx.` | [z-boy-x \| g-two] \| th-LIVE \| v-effort-x | covered |
| 33 | This mist will probably clear away. | `zavegal om bamegun thral thevem bral vemehulum.` | z-fog \| [near \| b-speaker] \| th-likely \| [th-INFERRED \| b-later] \| v-melt-recede | covered |
| 34 | Lovely flowers are growing everywhere. | `zavavulx gahabem thodum vezum ol bual.` | [z-flower-x \| g-beauty] \| th-LIVE \| v-growth \| [at \| b-everything] | covered |
| 35 | We should eat more slowly. | `zohan zereben zel hezehom vagudel thugethem.` | [z-interlocutors \| z-Usual \| z-rank/more \| h-slow] \| v-eat \| th-sake-ought-offered | covered |
| 36 | You have come too soon. | `zehodon zugen zuel bral vuvudel oel bamegun.` | [z-listener \| z-Some-sake \| z-rank/less \| b-later] \| v-go \| [toward \| b-speaker] | covered |
| 37 | You must write more neatly. | `zehodon zereben zel hozobam varadal themehom.` | [z-listener \| z-Usual \| z-rank/more \| h-cleanliness] \| v-write \| th-REQUIRE-demanded | covered |
| 38 | Directly opposite stands a wonderful palace. | `honovathohan zagazol gazebam vazadol.` | h-north-th-interlocutors \| [z-castle \| g-amazement] \| v-stand | covered |
| 39 | Henry's dog is lost. | `zodogal gadadom em bazawan.` | [z-dog \| g-loss] \| [used-by \| b-Azawan] | covered |
| 40 | My cat is black. | `zagadal gabagol em bamegun.` | [z-cat \| g-black] \| [used-by \| b-speaker] | covered |
| 41 | The little girl's doll is broken. | `zenezel galazem em begehal gamazam.` | [z-nesting-doll \| g-breakdown] \| [used-by \| [b-girl \| g-small]] | covered |
| 42 | I usually sleep soundly. | `zSELFn hual vezebal hanayam thogol.` | z-SELF \| h-always \| v-sleep \| h-depth \| th-COMMON | covered |
| 43 | The children ran after Jack. | `zahadelx thunom dahaben verezam.` | z-child-x \| th-WITNESSED \| d-Ahaben \| v-pursuit | covered |
| 44 | I can play after school. | `zSELFn vebogaxam hulam buzugul.` | z-SELF \| v-play-able \| [h-after \| b-school] | covered |
| 45 | We went to the village for a visit. | `zohan thunom vuvudel oel bahedem hagom bowogalol.` | z-interlocutors \| th-WITNESSED \| v-go \| [toward \| b-locality] \| [h-so-that \| b-attend] | covered |
| 46 | We arrived at the river. | `zohan thunom vevahal ol bowodel.` | z-interlocutors \| th-WITNESSED \| v-arrival \| [at \| b-drinking-water] | covered |
| 47 | I have been waiting for you. | `zSELFn thodum hagem dehodon vabazem.` | z-SELF \| th-LIVE \| h-still \| d-listener \| v-wait | covered |
| 48 | The campers sat around the fire. | `zaxagabolx thunom vehahel hegozem bavahel.` | z-agent-x-camp-x \| th-WITNESSED \| v-sit \| [h-around \| b-fire] | covered |
| 49 | A little girl with a kitten sat near me. | `glamazam zegehal gan bebebexagadal thunom vehahel om bamegun.` | [gl-small \| z-girl \| [g-including \| b-baby-x-cat]] \| th-WITNESSED \| v-sit \| [near \| b-speaker] | covered |
| 50 | The child waited at the door for her father. | `zahader thunom vabazem ol bodol glemehel debezal grebuwol bahar.` | z-←child.full \| th-WITNESSED \| v-wait \| at \| b-door \| gl-male \| d-person \| g-#-e-1 \| b-←←child.full | covered |
| 51 | Yesterday the oldest girl in the village lost her kitten. | `zegehal zel gebevam al bahedem thunom bazazam gruwol debebexagadal em begehar vadadom.` | [z-girl \| z-rank/more \| g-age] \| [in \| b-locality] \| [th-WITNESSED \| [b-day \| g-minus-one]] \| d-baby-x-cat \| [used-by \| b-←girl.full] \| v-loss | covered |
| 52 | Were you born in this village? | `yol ? zehodon al bahedem om bamegun vuhal.` | y-question \| ? \| z-listener \| [in \| b-locality] \| [near \| b-speaker] \| v-hatch | covered |
| 53 | Can your brother dance well? | `yol ? glemehel zebezal grebazol behodon vadazexal hebaham.` | y-question \| [? \| gl-male \| z-person \| [g-#-e0 \| b-listener]] \| v-dance-able \| h-excellence | covered |
| 54 | Did the man leave? | `yol ? zamahar vadebal.` | y-question \| ? \| z-←man.full \| v-departure | covered |
| 55 | Is your sister coming for you? | `yol ? gleveval zebezal grebazol behodon vuvudel oel behodon.` | y-question \| [? \| gl-female \| z-person \| [g-#-e0 \| b-listener]] \| v-go \| [toward \| b-listener] | covered |
| 56 | Can you come tomorrow? | `yol ? zehodon thumam bazazam grawol vuvudel oel bamegun.` | y-question \| ? \| z-listener \| [th-plan-itinerary \| [b-day \| g-one]] \| v-go \| [toward \| b-speaker] | covered |
| 57 | Have the neighbors gone away for the winter? | `yol ? zaxahazamx om bohan thamom vuvudelum hehum bagayum.` | y-question \| ? \| z-agent-x-home-x \| [near \| b-interlocutors] \| th-RESIDUE \| v-go-recede \| [h-while \| b-winter] | covered |
| 58 | Does the robin sing in the rain? | `yol ? zuam geredaxebedul vezehel am berehel.` | y-question \| [? \| z-everything.open \| g-red-x-bird] \| v-sing \| [amid \| b-rain] | covered |
| 59 | Are you going with us to the concert? | `yol ? zehodon han bamegunx vuvudel oel bexezehel.` | y-question \| ? \| z-listener \| [h-including \| b-speaker-x] \| v-go \| [toward \| b-scene-x-sing] | covered |
| 60 | Have you ever travelled in the jungle? | `yol ? zehodon huham vehebam am babahuxedehulx har.` | y-question \| ? \| z-listener \| h-already \| v-voyage \| [amid \| b-palm-x-tree-x] \| h-when | covered |
| 61 | We sailed down the river for several miles. | `zamegunx thunom bezezem grabarem vehebal uol bowodel.` | z-speaker-x \| [th-WITNESSED \| [b-meter \| g-+-e3.about]] \| v-ship \| [through \| b-drinking-water] | covered |
| 62 | Everybody knows about hunting. | `zuam vubugam hahehom buwuvam.` | z-everything.open \| v-knowledge \| [h-topic \| b-predation] | covered |
| 63 | On a Sunny morning after the solstice we started for the mountains. | `ol bedebem gazahol hulam bazahoxazadal zamegunx thunom damadalx vuvudeloel.` | [at \| [b-dawn \| g-sun]] \| [h-after \| b-sun-x-stop] \| z-speaker-x \| th-WITNESSED \| d-mountain-x \| v-go-head-for | covered |
| 64 | Tom laughed at the monkey's tricks. | `zamagel vedevam. zazawan thunom valavol ol bedevar.` | z-monkey \| v-mischief . z-Azawan \| th-WITNESSED \| v-laugh \| [at \| b-←mischief.full] | covered |
| 65 | An old man with a walking stick stood beside the fence. | `zoladal gan begehol thunom vazadol om buwalagozal.` | [z-old-man \| [g-including \| b-cane]] \| th-WITNESSED \| v-stand \| [near \| b-fence] | covered |
| 66 | The squirrel's nest was hidden by drooping boughs. | `denezal em bahebul thunom zedehuxabolx gadahel vohahem.` | d-nest \| [used-by \| b-chipmunk] \| th-WITNESSED \| [z-tree-x-bone-x \| g-down] \| v-concealment | covered |
| 67 | The little seeds waited patiently under the snow for the warm spring sun. | `glamazam zezulx hadahel bozezol thunom halawem vabazem dazahol wamazam gahadol gehum bahazom.` | [gl-small \| z-seedling-x] \| [h-down \| b-snow] \| th-WITNESSED \| h-composure \| v-wait \| [d-sun \| [w-small \| g-hot] \| [g-while \| b-spring]] | covered |
| 68 | Many little girls with wreaths of flowers on their heads danced around the bonfire. | `zegehalx gamazam gan bavavulagawulx zahen zel gral thunom vadazel hegozem bavahel.` | [[z-girl-x \| g-small \| [g-including \| b-wreath-x]] \| z-Typical \| z-rank/more \| g-amount] \| th-WITNESSED \| v-dance \| [h-around \| b-fire] | covered |
| 69 | The cover of the basket fell to the floor. | `zabahal gabom babezul thunom vadahel oel bahazalagudul.` | [z-up \| [g-part-of \| b-basket]] \| th-WITNESSED \| v-fall \| [toward \| b-floor] | covered |
| 70 | The first boy in the line stopped at the entrance. | `zobohal grewol thunom vazadal ol bodol.` | [z-boy \| g-1st] \| th-WITNESSED \| v-stop \| [at \| b-door] | covered |
| 71 | On the top of the hill in a little hut lived a wise old woman. | `aol bamadal thazom al bahedel gamazam vahazam zoladel geladem.` | [on \| b-mountain] \| th-STORY \| [in \| [b-hut \| g-small]] \| v-home \| [z-old-woman \| g-wisdom] | covered |
| 72 | During our residence in the country we often walked in the pastures. | `zamegunx zahen zel hral thunom vowogal am bevewulx hehum barl zamegunx vahazam am bagudom.` | [z-speaker-x \| z-Typical \| z-rank/more \| h-how-often] \| th-WITNESSED \| v-walk \| [amid \| b-field-x] \| [h-while \| b-that-clause] \| z-speaker-x \| v-home \| [amid \| b-rural] | covered |
| 73 | When will your guests from the city arrive? | `yol har glagum bezagam zebezalx gabebum behodon thevem bral vevahal.` | y-question \| h-when \| [[gl-origin \| b-urban] \| z-person-x \| [g-hospitality \| b-listener]] \| [th-INFERRED \| b-later] \| v-arrival | covered |
| 74 | Near the mouth of the river, its course turns sharply towards the East. | `om bamaval gabom bowodel zowor hanavam varevem oel bezadal.` | [near \| [b-mouth \| [g-part-of \| b-drinking-water]]] \| z-←drinking-water \| h-severity \| v-turn \| [toward \| b-east] | covered |
| 75 | Between the two lofty mountains lay a fertile valley. | `hozam bamadalx gradul gadavem zadahel gamahum.` | [h-between \| [b-mountain-x \| g-two \| g-height]] \| [z-down \| g-proliferation] | covered |
| 76 | Among the wheat grew tall red poppies. | `am bebadel thunom vezum zavavulx gadavem geredal.` | [amid \| b-grain] \| th-WITNESSED \| v-growth \| [z-flower-x \| g-height \| g-red] | covered |
| 77 | The strong roots of the oak trees were torn from the ground. | `dedehuxuvudalx gabezem gabom behazaledehulx thunom habahem vahegom ual bagudul.` | [d-tree-x-foot-x \| g-strength \| [g-part-of \| b-oak-x]] \| th-WITNESSED \| h-force \| v-removal \| [out-of \| b-ground] | covered |
| 78 | The sun looked down through the branches upon the children at play. | `zazahor thunom hadahel uol bedehuxabolx vazahem ol bahadelx gaxebogam.` | z-←sun.full \| th-WITNESSED \| h-down \| [through \| b-tree-x-bone-x] \| v-look \| [at \| [b-child-x \| g-agent-x-recreation]] | covered |
| 79 | The west wind blew across my face like a friendly caress. | `zewedul gewezal thunom vewedul hebevum bavezal em bamegun homem bahagel gazaham.` | [z-wind \| g-west] \| th-WITNESSED \| v-wind \| [h-across \| b-face] \| [used-by \| b-speaker] \| [h-like \| [b-hug \| g-goodwill]] | covered |
| 80 | The spool of thread rolled across the floor. | `zayahol thunom vewawel hebevum bahazalagudul.` | z-yarn \| th-WITNESSED \| v-wheel \| [h-across \| b-floor] | covered |
| 81 | A box of growing plants stood in the Window. | `zabegol gaham bahazulx gaxezum thunom vazadol al bewedol.` | [z-package \| [g-contents \| [b-house-plant-x \| g-agent-x-growth]]] \| th-WITNESSED \| v-stand \| [in \| b-window] | covered |
| 82 | I am very happy. | `welavam thozuthamam.` | [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] | covered |
| 83 | These oranges are juicy. | `zodaherx guhuzal om bamegun.` | [z-←tangerine.full-x \| g-juice] \| [near \| b-speaker] | covered |
| 84 | Sea water is salty. | `zual gohahaxowodel gozodal thogol.` | [z-everything \| g-ocean-x-drinking-water] \| g-salt \| th-COMMON | covered |
| 85 | The streets are full of people. | `zebezalx zahen zel gral al borodalx.` | [z-person-x \| z-Typical \| z-rank/more \| g-amount] \| [in \| b-road-x] | covered |
| 86 | Sugar tastes sweet. | `zual gagedem gozum thabem.` | [z-everything \| g-sugar] \| g-sweetness \| th-PATTERN | covered |
| 87 | The fire feels hot. | `zavaher gahadol thodum.` | [z-←fire.full \| g-hot] \| th-LIVE | covered |
| 88 | The little girl seemed lonely. | `thonathumam thevemegehar.` | th-relatedness-unmet-modifiable-INTERNAL-FLOWING \| th-INFERRED-←girl.full | by design (G-01) |
| 89 | The little boy's father had once been a sailor. | `glemehel zebezal gaxehebal grebuwol bobohal gamazam thunem.` | [gl-male \| z-person \| g-agent-x-ship \| [g-#-e-1 \| [b-boy \| g-small]]] \| th-FORMER | covered |
| 90 | I have lost my blanket. | `zSELFn thamom dayahom em bamegun vadadom.` | z-SELF \| th-RESIDUE \| d-blanket \| [used-by \| b-speaker] \| v-loss | covered |
| 91 | A robin has built his nest in the apple tree. | `zeredaxebedul thamom denezal vaguzal al baluxedehul.` | z-red-x-bird \| th-RESIDUE \| d-nest \| v-construct \| [in \| b-apple-x-tree] | covered |
| 92 | At noon we ate our lunch by the roadside. | `h_12 zamegunx thunom debedol em bamegunx vagudel om bexuvudel.` | h-_12 \| z-speaker-x \| th-WITNESSED \| d-bento \| [used-by \| b-speaker-x] \| v-eat \| [near \| b-scene-x-footprints] | covered |
| 93 | Mr. Jones made a knife for his little boy. | `zahaben thunom danaval vameval el bobohal gamazam grebawol bahar.` | z-Ahaben \| th-WITNESSED \| d-knife \| v-manufacture \| [for \| [b-boy \| g-small \| [g-#-e1 \| b-←Ahaben]]] | covered |
| 94 | Their voices sound very happy. | `welavam thozuthamam thodumebezarx.` | [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] \| th-LIVE-←person.full-x | covered |
| 95 | Is today Monday? | `yol ? zelagam grewol thodum.` | y-question \| [? \| z-weekday \| g-1st] \| th-LIVE | covered |
| 96 | Have all the leaves fallen from the tree? | `yol ? zual galevel ul bedehul huham vadahel.` | y-question \| [? \| z-everything \| g-leaf] \| [from \| b-tree] \| h-already \| v-fall | covered |
| 97 | Will you be ready on time? | `yol ? zehodon thevem bral vabum hawaham.` | y-question \| ? \| z-listener \| [th-INFERRED \| b-later] \| v-preparation \| h-punctuality | covered |
| 98 | Will you send this message for me? | `yem zehodon demeham om bamegun vobozam hadem bamegun.` | y-request \| z-listener \| d-message \| [near \| b-speaker] \| v-dispatch \| [h-on-behalf-of \| b-speaker] | covered |
| 99 | Are you waiting for me? | `yol ? zehodon damegun vabazem.` | y-question \| ? \| z-listener \| d-speaker \| v-wait | covered |
| 100 | Is this the first kitten of the litter? | `yol ? zebebexagadar g#1e0 om bamegun.` | y-question \| [? \| z-baby-x-cat \| g-#-1e0] \| [near \| b-speaker] | covered |
| 101 | Are these shoes too big for you? | `yol ? zuhahurx zugen zel gelavam behodon.` | y-question \| [? \| z-←dress-shoe.full-x \| z-Some-sake \| z-rank/more \| [g-big \| b-listener]] | covered |
| 102 | How wide is the River? | `yol zowoder wrar gagodem.` | y-question \| z-←drinking-water.full \| [w-how-many \| g-width] | covered |
| 103 | Listen. | `yel vemam.` | y-command \| v-listening | covered |
| 104 | Sit here by me. | `yel vehahel om bamegun.` | y-command \| v-sit \| [near \| b-speaker] | covered |
| 105 | Keep this secret until tomorrow. | `yel darth vaheham hodam bazazam grawol.` | y-command \| d-that-same-claim \| v-confidentiality \| [h-until \| [b-day \| g-one]] | covered |
| 106 | Come with us. | `yel han bamegunx vuvudel.` | y-command \| [h-including \| b-speaker-x] \| v-go | covered |
| 107 | Bring your friends with you. | `yel han bebezalx gemezem behodon vuvudel oel bamegun.` | y-command \| [h-including \| [b-person-x \| [g-companionship \| b-listener]]] \| v-go \| [toward \| b-speaker] | covered |
| 108 | Be careful. | `yel geyayem.` | y-command \| g-caution | covered |
| 109 | Have some tea. | `yem dedehel gral vozodel.` | y-request \| [d-tea \| g-more-than-one] \| v-drink | covered |
| 110 | Pip and his dog were great friends. | `zazawan zodogal em bazar zal welavam gemezem thunom.` | [z-Azawan \| [z-dog \| [used-by \| b-←Azawan]] \| z-and \| [w-very \| g-companionship]] \| th-WITNESSED | awkward (G-17) |
| 111 | John and Elizabeth are brother and sister. | `zazawan gemehel zalahen geveval zal grebazol.` | [[z-Azawan \| g-male] \| [z-Alahen \| g-female] \| z-and \| g-#-e0] | awkward (G-17) |
| 112 | You and I will go together. | `zohan thumam vuvudelx.` | z-interlocutors \| th-plan-itinerary \| v-go-x | covered |
| 113 | They opened all the doors and windows. | `zebezalx thunom dual godol vodol xal zebezarx dual gewedol vodol.` | [z-person-x \| th-WITNESSED \| [d-everything \| g-door] \| v-open \| x-and \| z-←person-x.full-x \| [d-everything \| g-window] \| v-open] | covered |
| 114 | He is small, but strong. | `zazawan gamazam. xagozal zazar gabezem.` | z-Azawan \| g-small . x-but \| z-←Azawan \| g-strength | covered |
| 115 | Is this tree an oak or a maple? | `yol zedehur gehazaledehul gemebal ?gar.` | y-question \| z-←tree.full \| [g-oak \| g-maple \| ?g-who] | covered |
| 116 | Does the sky look blue or gray? | `yol zagayom gubuhal gegagel ?gar thodum.` | y-question \| [z-sky \| [g-blue \| g-gray \| ?g-something]] \| th-LIVE | covered |
| 117 | Come with your father or mother. | `yel han bebezal grebuwol behodon vuvudel oel bamegun.` | y-command \| [h-including \| [b-person \| [g-#-e-1 \| b-listener]]] \| v-go \| [toward \| b-speaker] | covered |
| 118 | I am tired, but very happy. | `zSELFn gadadal. xagozal welavam thozuthamam.` | z-SELF \| g-tired . x-but \| [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] | covered |
| 119 | He played a tune on his wonderful flute. | `zazawan thunom duduhal vamegum ael buvudul gazebam em bazar.` | z-Azawan \| th-WITNESSED \| d-tune \| v-performance \| [using \| [b-flute \| g-amazement]] \| [used-by \| b-←Azawan] | covered |
| 120 | Toward the end of August the days grow much shorter. | `om b_#31,8 zazazamx zereben zuel welavam gadaham thabem.` | [near \| b-_31,8] \| [z-day-x \| z-Usual \| z-rank/less \| [w-very \| g-duration]] \| th-PATTERN | covered |
| 121 | A company of soldiers marched over the hill and across the meadow. | `aom bamadal gamazam zagadulx thunom vowogalx hebevum begezulx.` | [over \| [b-mountain \| g-small]] \| z-guard-x \| th-WITNESSED \| v-walk-x \| [h-across \| b-greens-x] | covered |
| 122 | The first part of the story is very interesting. | `zebeger welavam gagadam gabom bazom.` | [z-←begin.full \| [w-very \| g-curiosity] \| [g-part-of \| b-tale]] | covered |
| 123 | The crow dropped some pebbles into the pitcher and raised the water to the brim. | `zabagoxebedul thunom daragalx gamazam vadahel al bamevel xan zabar dowoder vabahal oel babahal gabom bamever.` | [z-black-x-bird \| th-WITNESSED \| [d-rock-x \| g-small] \| v-fall \| [in \| b-amphora] \| x-and-then \| z-←black-x-bird \| d-←drinking-water.full \| v-up \| [toward \| [b-up \| [g-part-of \| b-←amphora.full]]]] | covered |
| 124 | The baby clapped her hands and laughed in glee. | `zebeber thunom vagebul valavol val hegevam.` | z-←baby.full \| th-WITNESSED \| [v-clap \| v-laugh \| v-and \| h-delight] | covered |
| 125 | Stop your game and be quiet. | `yel hewem vebogam xal gezebom.` | y-command \| [h-no-longer \| v-play \| x-and \| g-silence] | covered |
| 126 | The sound of the drums grew louder and louder. | `zadehal gagum badavolx thunom hagawam vabedul.` | [z-audio \| [g-origin \| b-drum-x]] \| th-WITNESSED \| h-volume \| v-uptrend | covered |
| 127 | Do you like summer or winter better? | `yol zehodon dazagem dagayum ?der valavam.` | y-question \| z-listener \| [d-summer \| d-winter \| ?d-which-rank] \| v-cherished | covered |
| 128 | That boy will have a wonderful trip. | `zobohar thevem bral vehebam hazebam.` | z-←boy.full \| [th-INFERRED \| b-later] \| v-voyage \| h-amazement | covered |
| 129 | They popped corn, and then sat around the fire and ate it. | `zebezalx thunom dababol vugugel xan zebezarx vehahel hegozem bavahel xan zebezarx dababor vagudel.` | [z-person-x \| th-WITNESSED \| d-popcorn \| v-cooking \| x-and-then \| z-←person-x.full-x \| v-sit \| [h-around \| b-fire] \| x-and-then \| z-←person-x.full-x \| d-←popcorn.full \| v-eat] | covered |
| 130 | They won the first two games, but lost the last one. | `zebezalx thunom dazedemx g#1 al g#2 vevegol. xagozal zebezarx dazedem g#-1 vadadom.` | z-person-x \| th-WITNESSED \| [d-contest-x \| g-1st.short] \| through \| g-2nd.short \| v-victory . x-but \| z-←person-x.full-x \| [d-contest \| g-1st-from-end.short] \| v-loss | covered |
| 131 | Take this note, carry it to your mother; and wait for an answer. | `yel demeham om bamegun valagal oel bebezal geveval grebuwol behodon xal vabazem dezebem.` | y-command \| [d-message \| [near \| b-speaker] \| v-carry \| [toward \| [b-person \| g-female \| [g-#-e-1 \| b-listener]]] \| x-and \| v-wait \| d-discourse] | covered |
| 132 | I awoke early, dressed hastily, and went down to breakfast. | `zSELFn zahen zuel bral thunom vabahal xan zSELFn hadehom vedezal xan zSELFn vuvudel hadahel oel bebedol gedebem.` | [[z-SELF \| z-Typical \| z-rank/less \| b-later] \| th-WITNESSED \| v-up \| x-and-then \| z-SELF \| h-haste \| v-dress \| x-and-then \| z-SELF \| v-go \| h-down \| [toward \| [b-bento \| g-dawn]]] | covered |
| 133 | Aha! I have caught you! | `!yaladun. zSELFn thamom dehodon vamazel.` | !y-Aladun . z-SELF \| th-RESIDUE \| d-listener \| v-mousetrap | covered |
| 134 | This string is too short! | `! zevedur om bamegun zugen zuel geregam.` | ! \| z-←thread.full \| [near \| b-speaker] \| [z-Some-sake \| z-rank/less \| g-length] | covered |
| 135 | Oh, dear! the wind has blown my hat away! | `!yewedan. zewedur thamom dazehal em bamegun vewedulum.` | !y-Ewedan . z-←wind.full \| th-RESIDUE \| d-sun-hat \| [used-by \| b-speaker] \| v-wind-recede | covered |
| 136 | Alas! that news is sad indeed! | `!yagahun. zunuzer wonathumam gobom.` | !y-Agahun . z-←newspaper.full \| [w-relatedness-unmet-modifiable-INTERNAL-FLOWING \| g-stimulus] | covered |
| 137 | Whew! that cold wind freezes my nose! | `!yuvuyun. zewedur gogodel donozal gabom bamegun vazahul.` | !y-Uvuyun . [z-←wind.full \| g-cold] \| [d-nose \| [g-part-of \| b-speaker]] \| v-ice | covered |
| 138 | Are you warm enough now? | `yol ? zehodon zugen zael gahadol thahum bagazem grazol.` | y-question \| [? \| z-listener \| z-Some-sake \| z-equal-rank \| g-hot] \| [th-FELT \| [b-hour \| g-zero]] | covered |
| 139 | They heard the warning too late. | `zebezalx zugen zel bral thunom dowawol vemal.` | [z-person-x \| z-Some-sake \| z-rank/more \| b-later] \| th-WITNESSED \| d-warning \| v-hear | covered |
| 140 | We are a brave people, and love our country. | `zamegunx galahem xal zamegunx dagul em bamegunx valaval.` | [z-speaker-x \| g-courage \| x-and \| z-speaker-x \| d-country \| [used-by \| b-speaker-x] \| v-love] | covered |
| 141 | All the children came except Mary. | `zual gahadel ul zalahen thunom vevahal.` | [z-everything \| g-child] \| except \| z-Alahen \| th-WITNESSED \| v-arrival | covered |
| 142 | Jack seized a handful of pebbles and threw them into the lake. | `zahaben thunom dahadal gaham baragalx gamazam vevedol xan zahaber daragarx vubuvel al bagevom.` | [z-Ahaben \| th-WITNESSED \| [d-hand \| [g-contents \| [b-rock-x \| g-small]]] \| v-fist \| x-and-then \| z-←Ahaben.full \| d-←rock-x.full-x \| v-throw \| [in \| b-lake]] | covered |
| 143 | This cottage stood on a low hill, at some distance from the village. | `zagudor thazom vazadol aol bamadal gamazam um bahedem.` | z-←cottage.full \| th-STORY \| v-stand \| [on \| [b-mountain \| g-small]] \| [away-from \| b-locality] | covered |
| 144 | On a fine summer evening, the two old people were sitting outside the door of their cottage. | `ol badazol gahabem gehum bazagem zebezalx gradul goladam thazom vehahel ol bodol gabom bagudol em bebezarx.` | [at \| [b-dusk \| g-beauty \| [g-while \| b-summer]]] \| [z-person-x \| g-two \| g-elderhood] \| th-STORY \| v-sit \| [at \| [b-door \| [g-part-of \| b-cottage]]] \| [used-by \| b-←person-x.full-x] | covered |
| 145 | Our bird's name is Jacko. | `zebedul em bamegunx. zebedur gogal bahaben.` | z-bird \| [used-by \| b-speaker-x] . z-←bird.full \| [g-SAME \| b-Ahaben] | covered |
| 146 | The river knows the way to the sea. | `zowoder dorodal oel bohahal vubugam.` | z-←drinking-water.full \| d-road \| [toward \| b-ocean] \| v-knowledge | covered |
| 147 | The boat sails away, like a bird on the wing. | `zobodar thodum vobodalum homem bebedul gaxewehal.` | z-←boat.full \| th-LIVE \| v-boat-recede \| [h-like \| [b-bird \| g-agent-x-wing]] | covered |
| 148 | They looked cautiously about, but saw nothing. | `zebezalx thunom heyayem vazahem ol bual. xagozal zebezarx dal vahahal.` | z-person-x \| th-WITNESSED \| h-caution \| v-look \| [at \| b-everything] . x-but \| z-←person-x.full-x \| d-none \| v-see | covered |
| 149 | The little house had three rooms, a sitting room, a bedroom, and a tiny kitchen. | `zexehahel zexezebal zexugugel welavam gamazam zal gabom bahazar gamazam thunom.` | [z-scene-x-chair \| z-scene-x-sleep \| [z-scene-x-cooking \| [w-very \| g-small]] \| z-and \| [g-part-of \| [b-←house.full \| g-small]]] \| th-WITNESSED | covered |
| 150 | We visited my uncle's village, the largest village in the world. | `zamegunx thunom dahedem em bebezal gemehel grebazol bebezal grebuwol bamegun vowogalol. zaheder zel gelavam al bolol.` | z-speaker-x \| th-WITNESSED \| d-locality \| [used-by \| [b-person \| g-male \| [g-#-e0 \| [b-person \| [g-#-e-1 \| b-speaker]]]]] \| v-attend . [z-←locality.full \| z-rank/more \| g-big] \| [in \| b-globe] | covered |
| 151 | We learn something new each day. | `zamegunx velehal dar gunuzem hrawol hruwol bazazam.` | z-speaker-x \| v-learn \| [d-something \| g-news] \| h-one \| [h-divided-by-one \| b-day] | covered |
| 152 | The market begins five minutes earlier this week. | `zozodom vebegel zereben zuel bral bumunum g+5 hehum bagader om bamegun.` | z-market \| v-begin \| [z-Usual \| z-rank/less \| b-later] \| [b-minute \| g-five.short] \| [h-while \| b-←calendar.full] \| [near \| b-speaker] | covered |
| 153 | Did you find the distance too great? | `yol ? zeregam zugen zel gelavam behodon thunom.` | y-question \| [? \| z-length \| z-Some-sake \| z-rank/more \| [g-big \| b-listener]] \| th-WITNESSED | covered |
| 154 | Hurry, children. | `yahadelx. yel vadehom.` | y-child-x . y-command \| v-haste | covered |
| 155 | Madam, I will obey your command. | `yehodon. zSELFn thumam vuyoyum dehodon.` | y-listener . z-SELF \| th-plan-itinerary \| v-conformity \| d-listener | covered |
| 156 | Here under this tree they gave their guests a splendid feast. | `zebezalx thunom om bamegun hadahel bedehur vebezol bebezalx gabebum bebezarx debedol gazebam.` | z-person-x \| th-WITNESSED \| [near \| b-speaker] \| [h-down \| b-←tree.full] \| v-present \| [b-person-x \| [g-hospitality \| b-←person-x.full-x]] \| [d-bento \| g-amazement] | covered |
| 157 | In winter I get up at night, and dress by yellow candlelight. | `zSELFn thogol hehum bagayum vabahal hehum banadal xal zSELFn vedezal ael bagegal geyayel.` | [z-SELF \| th-COMMON \| [h-while \| b-winter] \| v-up \| [h-while \| b-night] \| x-and \| z-SELF \| v-dress \| [using \| [b-candle \| g-yellow]]] | covered |
| 158 | Tell the last part of that story again. | `yel herebem deveham gabom bazom vezebel.` | y-command \| h-again \| [d-terminus \| [g-part-of \| b-tale]] \| v-tell | covered |
| 159 | Be quick or you will be too late. | `yel gadehom xol zehodon zugen zel bral vevahal.` | y-command \| [g-haste \| x-or-exactly-one \| [z-listener \| z-Some-sake \| z-rank/more \| b-later] \| v-arrival] | covered |
| 160 | Will you go with us or wait here? | `yol ? zehodon thumam han bamegunx vuvudel xol zehodon thumam vabazem om bamegun.` | y-question \| [? \| z-listener \| th-plan-itinerary \| [h-including \| b-speaker-x] \| v-go \| x-or-exactly-one \| z-listener \| th-plan-itinerary \| v-wait \| [near \| b-speaker]] | covered |
| 161 | She was always, shabby, often ragged, and on cold days very uncomfortable. | `zalahen thunom hual galazem. zalahen thunom zahen zel hral welavam galazem. zalahen thunom welavam gahagem gul hehum bazazamx gogodel.` | z-Alahen \| th-WITNESSED \| h-always-except \| g-breakdown . z-Alahen \| th-WITNESSED \| [z-Typical \| z-rank/more \| h-how-often] \| [w-very \| g-breakdown] . z-Alahen \| th-WITNESSED \| [[w-very \| g-comfort] \| g-not] \| [h-while \| [b-day-x \| g-cold]] | covered |
| 162 | Think first and then act. | `yel vevegal xan vazewem.` | y-command \| [v-think \| x-and-then \| v-effort] | covered |
| 163 | I stood, a little mite of a girl, upon a chair by the window, and watched the falling snowflakes. | `zSELFn th(zSELFr gegehal gamazam) thunom vazadol aol behahel om bewedol xal zSELFn thunom vazahem dozovelx gaxadahel.` | [z-SELF \| th-ASIDE[z-←SELF.full \| g-girl \| g-small] \| th-WITNESSED \| v-stand \| [on \| b-chair] \| [near \| b-window] \| x-and \| z-SELF \| th-WITNESSED \| v-look \| [d-snowflake-x \| g-agent-x-down]] | covered |
| 164 | Show the guests these shells, my son, and tell them their strange history. | `yehodon. yel zebezalx gabebum bamegun deheholx om bamegun vahahal thegem behodon. yel bebezarx dazom gelehom em bebezarx vezebel.` | y-listener . y-command \| [z-person-x \| [g-hospitality \| b-speaker]] \| d-shell-x \| [near \| b-speaker] \| v-see \| [th-CAUSE \| b-listener] . y-command \| b-←person-x.full-x \| [d-tale \| g-strangeness] \| [used-by \| b-←person-x.full-x] \| v-tell | covered |
| 165 | Be satisfied with nothing but your best. | `yel gerevam ol bazewem em behodon bal.` | y-command \| g-calm \| [at \| [[b-effort \| [used-by \| b-listener]] \| b-and]] | covered |
| 166 | We consider them our faithful friends. | `zamegunx vevegal darl zebezarx godogam gemezem bamegunx.` | z-speaker-x \| v-think \| d-that-clause \| [z-←person.full-x \| g-loyalty \| [g-companionship \| b-speaker-x]] | covered |
| 167 | We will make this place our home. | `zamegunx thumam dahedem om bamegun vameval el bahazam em bamegunx.` | z-speaker-x \| th-plan-itinerary \| d-locality \| [near \| b-speaker] \| v-manufacture \| [for \| b-home] \| [used-by \| b-speaker-x] | covered |
| 168 | The squirrels make their nests warm and snug with soft moss and leaves. | `zahebulx thogol denezalx wadeham gahadol gahagem em bahebur ael bebahel balevel bal vameval.` | z-chipmunk-x \| th-COMMON \| [d-nest-x \| [w-quite \| g-hot] \| g-comfort] \| [used-by \| b-←chipmunk-x.full] \| [using \| [b-herb \| b-leaf \| b-and]] \| v-manufacture | covered |
| 169 | The little girl made the doll's dress herself. | `zegehal gamazam zal thunom dedezal em benezel vameval.` | [[z-girl \| g-small] \| z-and] \| th-WITNESSED \| d-dress \| [used-by \| b-nesting-doll] \| v-manufacture | covered |
| 170 | I hurt myself. | `zSELFn dSELFr venehem.` | z-SELF \| d-←SELF.full \| v-harm | covered |
| 171 | She was talking to herself. | `zalahen thunom balaher vezebel.` | z-Alahen \| [th-WITNESSED \| b-←Alahen.full] \| v-tell | covered |
| 172 | He proved himself trustworthy. | `zazawan thunom dazawar gegehom verazem.` | z-Azawan \| th-WITNESSED \| [d-←Azawan.full \| g-trust] \| v-proof | covered |
| 173 | We could see ourselves in the water. | `zamegunx thunom damegurx vahahal al bowodel.` | z-speaker-x \| th-WITNESSED \| d-←speaker-x.full-x \| v-see \| [in \| b-drinking-water] | covered |
| 174 | Do it yourself. | `yel zehodon zal vazewem.` | y-command \| [z-listener \| z-and] \| v-effort | covered |
| 175 | I feel ashamed of myself. | `zSELFn thonathumom bSELFr.` | z-SELF \| [th-relatedness-unmet-modifiable-AIMED-FLOWING \| b-←SELF.full] | covered |
| 176 | Sit here by yourself. | `yel zehodon zal vehahel om bamegun.` | y-command \| [z-listener \| z-and] \| v-sit \| [near \| b-speaker] | covered |
| 177 | The dress of the little princess was embroidered with roses, the national flower of the Country. | `dedezal em begehal gamazam gagawum venedal ael borozalx. zorozarx gavavul gabom bagul.` | d-dress \| [used-by \| [b-girl \| g-small \| g-leadership]] \| v-needle \| [using \| b-rose-x] . [z-←rose-x.full-x \| g-flower \| [g-part-of \| b-country]] | covered |
| 178 | They wore red caps, the symbol of liberty. | `zebezalx thunom dagebalx geredal vedezal. zagebarx gezezul gahehom bazodam.` | z-person-x \| th-WITNESSED \| [d-cap-x \| g-red] \| v-dress . [z-←cap-x.full-x \| g-symbols \| [g-topic \| b-liberty]] | covered |
| 179 | With him as our protector, we fear no danger. | `han bazawan gagadul em bamegunx zamegunx dogozom dul vevehel.` | [h-including \| [b-Azawan \| g-guard]] \| [used-by \| b-speaker-x] \| z-speaker-x \| [d-danger \| d-not] \| v-fear | covered |
| 180 | All her finery, lace, ribbons, and feathers, was packed away in a trunk. | `dual gerebum em balahen valagal al balagal.` | [d-everything \| g-embellishment] \| [used-by \| b-Alahen] \| v-carry \| [in \| b-luggage] | covered |
| 181 | Light he thought her, like a feather. | `zazawan vevegal darl zalahen zugen zuel garagam homem bevevul.` | z-Azawan \| v-think \| d-that-clause \| [z-Alahen \| z-Some-sake \| z-rank/less \| g-heavy] \| [h-like \| b-feather] | covered |
| 182 | Every spring and fall our cousins pay us a long visit. | `zebezalx grebawol bebezal grebazol bebezal grebuwol bamegunx thogol hehum bual gahazom xal hehum bual gelevum hadaham damegunx vowogalol.` | [[z-person-x \| [g-#-e1 \| [b-person \| [g-#-e0 \| [b-person \| [g-#-e-1 \| b-speaker-x]]]]]] \| th-COMMON \| h-while \| [b-everything \| g-spring] \| x-and \| h-while \| [b-everything \| g-autumn] \| h-duration \| d-speaker-x \| v-attend] | covered |
| 183 | In our climate the grass remains green all winter. | `zual gegezul gegal hagem hehum bagayum am bogom em bamegunx.` | [z-everything \| g-greens] \| g-green \| h-still \| [h-while \| b-winter] \| [amid \| b-weather] \| [used-by \| b-speaker-x] | covered |
| 184 | The boy who brought the book has gone. | `zobohal thunom dubugal valagal. zobohar thamom vuvudelum.` | z-boy \| th-WITNESSED \| d-book \| v-carry . z-←boy.full \| th-RESIDUE \| v-go-recede | covered |
| 185 | These are the flowers that you ordered. | `zehodon thunom davavulx vagagum. zavavurx om bamegun thodum.` | z-listener \| th-WITNESSED \| d-flower-x \| v-consumption . z-←flower-x.full-x \| [near \| b-speaker] \| th-LIVE | covered |
| 186 | I have lost the book that you gave me. | `zehodon thunom dubugal bamegun vebezol. zSELFn thamom dubugar vadadom.` | z-listener \| th-WITNESSED \| d-book \| b-speaker \| v-present . z-SELF \| th-RESIDUE \| d-←book.full \| v-loss | covered |
| 187 | The fisherman who owned the boat now demanded payment. | `zaxevehol thunom dobodal vegabem. zaxegaber thodum vern derl damol vebezol.` | z-agent-x-fish \| th-WITNESSED \| d-boat \| v-ownership . z-←agent-x-ownership \| th-LIVE \| v-command \| d-to-clause \| d-money \| v-present | covered |
| 188 | Come when you are called. | `yel vuvudel oel bamegun hehum barl dehodon vobozem.` | y-command \| v-go \| [toward \| b-speaker] \| [h-while \| b-that-clause] \| d-listener \| v-summons | covered |
| 189 | I shall stay at home if it rains. | `zSELFn thumam vahazam thodom barl verehel.` | z-SELF \| th-plan-itinerary \| v-home \| [th-if \| b-that-clause] \| v-rain | covered |
| 190 | When he saw me, he stopped. | `zazawan thunom vazadal hehum barl zazawan thunom damegun vahahal.` | z-Azawan \| th-WITNESSED \| v-stop \| [h-while \| b-that-clause] \| z-Azawan \| th-WITNESSED \| d-speaker \| v-see | covered |

### Notes

- **STC-1–10, *the sun*:** a full-root resume `zazahor` with no antecedent is *the one we both know*, which fits a unique referent. No article gap.
- **STC-1:** read as a plain report. A general truth (*the sun shines, as a rule*) would add *always* `hual`.
- **STC-2–7, tense:** by design (no tense letter). The progressive is LIVE, the past is WITNESSED, and the future is a channel + `bral`. *Tomorrow* is the day offset +1 on that channel. Each forecast has to choose a warrant; PATTERN is the honest one for sunrise.
- **STC-5, *has been shining*:** *still* `hagem` carries "began earlier, goes on now". The English duration-up-to-now is only implied; a measured duration would need a measure phrase.
- **STC-10, *now*:** LIVE already means "in view now" and takes no zero offset, so there is no separate *now* word.
- **STC-8:** with `v:shine` on *bright*, `habawel vabawel` reads *shines brightly*, like the English.
- **STC-11–13, *the people*:** `zual gebezal` with no place hook is every person the situation is about. *Some of* / *many of* resume the known group (`zebezarx`) and give the amount, per the denominator recipe; *many* names the Typical bar.
- **STC-15–20, *kitten*:** a live compound, *baby* `x` *cat* (`ebebexagada`); later mentions resume it in full.
- **STC-17, 26, 31, 33, *away*:** hook compound with `um` (*recede*) on the motion verb: `vowogalum`, `vuvudelum`, `vewawelum`, `vemehulum`.
- **STC-19, 21:** *came down* is *fall*; *has stopped* is *no longer* `hewem` (the rain no longer falls), so no *stop* verb is needed.
- **STC-24, *once*:** FORMER `thunem` (a past climate, not today's). *Here* is `om bamegun`.
- **STC-28, *should*:** prescription with the unnamed sake, `thugethem`. **STC-37, *must*:** `themehom`.
- **STC-29, *happy to*:** emotion compose on `/th/`: pleasure met, INTERNAL, FLOWING (`thozuthamam`) — the speaker's own feeling, so no holder is needed.
- **STC-33, *probably*:** stance number `thral` (*likely*, no figure).
- **STC-38, *opposite*:** `honovathohan` — in front, as the two of us face. *Directly* is dropped.
- **STC-45, *village*:** *hut* in its abstract sense, `bahedem` (*locality*). *For a visit* is `hagom` + the *attend* compound as a noun.
- **STC-47, *wait for you*:** the awaited person is the object.
- **STC-50, *her father*:** kin number `grebuwol` (the layer above) + `/b/` the child, with *male* before it. Long, but every piece is taught.
- **STC-51, *oldest girl in the village*:** superlative `zegehal zel gebevam`; the group in play is set by the clause-level *in the village* hook. *Yesterday* is the day offset −1 on WITNESSED.
- **STC-52–56, 59, 73, 97, 99, questions:** no channel under `yol` where *did* / *are … coming* read from the bare verb. A question about intent takes PLAN (STC-56 *can you come tomorrow*). A forecast in a question puts a channel under `yol`, which asks for the listener's warrant (STC-73, 97: INFERRED + `bral`). *Ready* in STC-97 is the verb *prepare* (`vabum`), since `gabum` is *before*.
- **STC-52, *this village*:** `al bahedem om bamegun`: a hook + `/b/` right after a landmark describes it (*the village near me*).
- **STC-53, 55, *your brother / sister*:** sibling kin `grebazol` + `/b/` listener, with *male* / *female* before. **STC-89, 93, *father*, *his boy*:** `grebuwol` / `grebawol` on the kin anchor.
- **STC-57, *neighbors*:** agent compound on *home* (`zaxahazamx`) + *near us*. *Gone away* keeps RESIDUE (they are still away). *Winter* is the *gloves* abstract (`bagayum`).
- **STC-58, 91, *robin*:** compound *red* `x` *bird* (`eredaxebedu`); the habit question is an open universal `zuam`.
- **STC-59, *concert*:** scene compound on *sing* (`bexezehel`, a sing-event). *With us* (not the listener) is `han bamegunx`. **STC-63, 72, 92:** narrative *we* that leaves the listener out is `zamegunx`, not `zohan`.
- **STC-60, *ever*:** `huham … har`. *Travel* is `vehebam` (*voyage*). *Jungle* is the compound *palm* `x` *tree* (`babahuxedehulx`).
- **STC-61, *several miles*:** metric, not miles: `bezezem grabarem` (*thousands of meters*, about). *Down* the river is dropped.
- **STC-62, *knows*:** the *book* abstract as a verb (`vubugam`); *about* is `hahehom`. *Everybody* is open `zuam` (as far as I know). *Hunting* stays *predation* (`buwuvam`); the verb *hunt* is `varehel`, role English on *archery*.
- **STC-63, *solstice*:** compound *sun* `x` *stop* (`bazahoxazadal`). *Started for* is the hook compound *go* + *toward* (`vuvudeloel`).
- **STC-63, 71, 74, 76:** fronted place phrases (`aol bamadal …`, `am bebadel …`) now parse as extra-noun hooks (parser fix; see results).
- **STC-64, *the monkey's tricks*:** two sentences, then an event resume (`bedevar`), the recipe for an act as someone's (say-people-places.md § someone's act).
- **STC-66, *was hidden by*:** object first, then the hider as subject. *Boughs* is *tree* `x` *bone* (`zedehuxabolx`).
- **STC-67, *spring sun*:** the time pole on the noun, `gehum bahazom` (*during spring*).
- **STC-68, *wreaths … on their heads*:** *wreath* is the compound `bavavulagawulx`. *On their heads* is dropped: a hook + `/b/` after the wreath (`aol behadalx`) would split the *many* rank from its noun. *Head* is `behadal`.
- **STC-70, *in the line*:** dropped; the ordinal already says the order.
- **STC-71, *lived*:** TALE `thazom`, since this is story narration.
- **STC-73, *your guests*:** people cannot take `em`, so *guests* is the *hospitality* tie (`gabebum behodon`); *from the city* goes before the noun with `gl-`, since two relation adjectives cannot follow one noun.
- **STC-74, *sharply*:** `hanavam` (*severity*, the knife abstract). *Course turns* is `varevem` (*turn*, the abstract on *refresh*).
- **STC-75, 76, 78, 79:** an `/h/`-hosted `/b/` now keeps its adjectives (`hozam bamadalx gradul gadavem`, `homem bamezal gazaham`; parser fix).
- **STC-82, 94, *happy*:** emotion compose, pleasure met, INTERNAL, FLOWING (`thozuthamam`). Someone else's feeling takes a holder (STC-88 `thevemegehar`, STC-94 `thodumebezarx`); a holder can be a full-root resume, and a group takes **-x** (*those people*).
- **STC-83, *these oranges*:** full-root resume (the ones we both see) plus *near me*; a new noun would read as *there are juicy oranges here*.
- **STC-84, *sea water is salty*:** `zual` + kind + `/ɡ/` is a property of every member; COMMON (`thogol`) says *as a rule*.
- **STC-85, *full of people*:** approximated as *many people in the streets* (Typical bar). *Streets* is *road* (`borodalx`).
- **STC-86, 87, *tastes / feels*:** the sense is the channel: LIVE for a present touch, PATTERN for a general taste. *Sugar* is the *candy* abstract (`gagedem`).
- **STC-89, *had once been*:** FORMER `thunem`. The predicate *sailor* sits between the noun and the kin relation, so it describes the father, not the boy.
- **STC-95, *Monday*:** *first weekday* (`zelagam grewol`, counting from Monday) under LIVE for *today*.
- **STC-65, 69, 72, 76, 77, 79, 80, 144, new words:** *fence* `buwalagozal`, *floor* `bahazalagudul`, *field* `bevewulx`, *wheat* `bebadel` (*grain*), *oak* `behazaledehulx`, *ground* `bagudul`, *face* `bavezal`, *summer* `bazagem`.
- **STC-72, 79, 96, new rows:** *country* is `bagudom` (*rural*), *caress* is *hug* (`bahagel`), *leaves* is `galevel`.
- **STC-98, a polite request:** English *Will you … for me?* is a request, so it takes soft request `yem`; *for me* is proxy `hadem`.
- **STC-100, *first of the litter*:** eldest sibling `g#1e0`.
- **STC-101, 115, *these shoes* / *this tree*:** full-root resume only. `om bamegun` before a rank join or a fill-ask list would make the next `/ɡ/` words describe the speaker (the landmark). *Too big for you* is the Some-sake bar with the listener as whose need (`gelavam behodon`).
- **STC-102, *how wide*:** `wrar` on *width* (`gagodem`, the *accordion* abstract).
- **STC-103–108, commands:** *listen* is the *ear* abstract as a verb (`vemam`), not *hear* (`vemal`). *Keep this secret* is *keep confidential* (`vaheham`, the *hush* abstract) with `darth` for *this*; *until tomorrow* is a signed day count in the pole's `/b/` (`hodam bazazam grawol`), counted from now. *Be careful* is `yel geyayem`, a command with only a `/ɡ/` body. *Come* / *bring … with you* is `vuvudel` + `han` (company); with a place, `oel bamegun`.
- **STC-90, *blanket*:** the *yarn* abstract (`dayahom`). **STC-134, *too short*:** less *length* (`geregam`, the *railcar* abstract). **STC-142, *threw … lake*:** `vubuvel` (role English on *boomerang*) and `bagevom` (the *canoe* abstract).
- **STC-109, *have some tea*:** an offer, so soft request `yem`; `gral` on a mass noun is *some*. The verb is `vozodel` (*drink*, role English on *soda*).
- **STC-110, 111, *friends* / *brother and sister*:** the tie or kin word is SHARED after the join with no `/b/`, so *of each other* is only implied (G-17). *His dog* is a hook + `/b/` right before the join word (`zodogal em bazar zal`, G-18).
- **STC-112, *go together*:** PLAN plus collective **-x** on the verb.
- **STC-113, *all the doors and windows*:** two *every K* clauses, since a kind join after `dual` does not read as one kind. *Open* is `vodol` (role English on *door*).
- **STC-114, 118, 130, 148, *but*:** the linker `xagozal` starts a second sentence. *Small but strong*, *tired but happy*: the first claim sets an expectation the second blocks.
- **STC-116, *the sky … look*:** *sky* (`zagayom`, the *cloud* abstract) and *gray* (`gegagel`); *look* is LIVE, as *feels* was in STC-87. The choice is a fill-ask over the two colors (`?gar`).
- **STC-117, 131, 150, kin:** *father or mother* is the parent layer with no mantissa (`grebuwol`, one member). *Uncle* is a male sibling of a parent. *Mother* is `geveval` before the kin number.
- **STC-119, *played a tune on*:** *perform* (`vamegum`) with the flute as a tool (`ael`); `em bazar` follows the flute's adjective, as in hooks.md § Whose.
- **STC-120, *toward the end of August*:** *near 31 August* (`om b_#31,8`). *The days grow much shorter* is *much less duration than usual* on PATTERN.
- **STC-121, *company of soldiers marched*:** *guards* (💂) walking as one act (`vowogalx`). The fronted *over the hill* keeps the two extras apart.
- **STC-122, *the first part of the story*:** *the beginning* (`zebeger`, a full-root resume), with *interesting* (*curiosity*) before the relation so it describes the beginning, not the story.
- **STC-123, *crow*, *pitcher*, *brim*:** *black* `x` *bird*, *amphora*, *the top part of it*. *Dropped* is *fall* with an object.
- **STC-124, *in glee*:** SHARED `/h/` after a verb join covers both verbs. The manner is observable, so no holder is needed.
- **STC-125, *stop … and be quiet*:** *no longer play* (`hewem vebogam`), then *be quiet* as a `/ɡ/`-only command clause (`gezebom`) in a clause join under the same command.
- **STC-126, *louder and louder*:** *rose in volume* (`hagawam vabedul`, the uptrend verb).
- **STC-127, *better*:** `?der` asks which ranks first. *Summer* is the *ice-cream* abstract (`dazagem`).
- **STC-128, 139:** *will* is INFERRED + `bral`; *too late* is `zugen zel bral`.
- **STC-129, 132, 142:** a string of acts by one subject is `xan` with a resumed subject, since verb-join items cannot carry their own objects (G-19).
- **STC-133–137, interjections:** `/y/` + **-n** on the matching root: *aha* is *insight* (`yaladun`), *oh dear* is *worried* (`yewedan`), *alas* is *cry* (`yagahun`), *whew* is *phew* (`yuvuyun`). *Indeed* and the English *!* are the `!` tone mark.
- **STC-136, *that news is sad*:** the speaker's feeling on a noun they do not own, so emotion compose on `/w/` + `gobom`.
- **STC-138, *warm enough now*:** the Some-sake tie on *hot*, and FELT with a zero offset asks what the listener's body says now.
- **STC-140, *a brave people*:** reduced to *we are brave*.
- **STC-143, 144:** story narration, so TALE. *Outside the door* is *at the door*.
- **STC-145, *our bird's name is Jacko*:** two sentences, since `gogal` after `em bamegunx` would describe the speaker group.
- **STC-146, *the way to the sea*:** *road* with *toward the sea*.
- **STC-147, *on the wing*:** *flier* (agent compound on *wing*).
- **STC-149, *rooms*:** scene compounds on *chair*, *sleep*, and *cooking*. *Had three rooms* is an existence list SHARED as *part of the little house*; the count is the list.
- **STC-151, 182, *each day* / *every spring and fall*:** a counted unit is a count per unit (`hrawol hruwol bazazam`, once per day); named seasons are a universal kind in the time pole (`hehum bual gahazom`). *Something new* is `dar` (an unnamed new thing) plus *news* (`gunuzem`).
- **STC-152, *market*, *minutes*, *this week*:** *market* is the new abstract on 🏬 (`zozodom`, L-09). *Minute* is the new stock unit `bumunum` (L-10). *This week* is the full-root resume `bagader` plus `om bamegun`, which describes the week ([hook + `/b/` on a landmark](../grammar/hooks.md)). *Earlier* is the `bral` scale against the *Usual* bar.
- **STC-153, *find … too great*:** *distance* is *length* (`zeregam`). WITNESSED under `yol` asks for the listener's own warrant, as in STC-97.
- **STC-154, 155, 164, address:** *children* is a kind vocative with **-x** (`yahadelx`). *Madam* and *my son* are the listener (`yehodon`); the title and the kin word are dropped.
- **STC-155, *obey*:** `vuyoyum` (the *conformity* abstract). *Command* is dropped; `vern` states a command as content, but here the act is the obeying.
- **STC-156, *here under this tree*:** `hadahel` + landmark is *under* (roles.md § gravity). *Feast* is a wonderful *bento* (`debedol gazebam`), *gave* is `vebezol` (*present*), and *their guests* is the *hospitality* tie with a resume (`bebezalx gabebum bebezarx`).
- **STC-157, *in winter … at night*:** two `hehum` poles, with COMMON for the routine. *Candlelight* is *using a yellow candle* (`geyayel`); *get up* is `vabahal` (*up*), *dress* is `vedezal`.
- **STC-158, *last part*:** *the end* (`deveham`, the *finish-line* abstract) of the tale, as in STC-122.
- **STC-159, 160, *or*:** `xol` between clauses. In 159 the second clause is the rank claim *later than needed* with the verb *arrive*, so the threat is the outcome, not a forecast.
- **STC-161, *shabby*, *ragged*, *uncomfortable*:** three claims. *Shabby* and *ragged* are *breakdown* (`galazem`, as *broken* in STC-41), with `welavam` on the second; *uncomfortable* is *not comfortable* (`gahagem gul`) placed before the *cold days* pole so the `/w/` word stays on the adjective.
- **STC-162, *think first and then act*:** verb join `xan` (*and then*). *Act* is *effort* (`vazewem`).
- **STC-163, *a little mite of a girl*:** an aside with a resume of the speaker (`th(zSELFr gegehal gamazam)`). *Falling* is the agent compound on *down* (`gaxadahel`).
- **STC-164, *show … tell*:** *show* is CAUSE with the listener as causer (`thegem behodon`): the guests are the subject of *see*. *History* is *tale*, and *strange* is the *alien* abstract (`gelehom`).
- **STC-165, *nothing but*:** the single-item **-l** join is *just* ([joins](../grammar/joins.md)): `ol bazewem em behodon bal` is *at only your effort*. *Best* is *effort*.
- **STC-166, *consider … faithful friends*:** `darl` and a second sentence. *Faithful* is the *loyalty* abstract on *dog* (`godogam`).
- **STC-167, *make this place our home*:** *make* (`vameval`) with `el` (*for*) and *home* (`bahazam`, the *house* abstract), owned by us with `em`. *This place* is *locality* plus `om bamegun`.
- **STC-168, *warm and snug … soft moss*:** *warm* is *quite hot* (`wadeham gahadol`), *snug* is *comfort*, *moss* is *herb* (`bebahel`); *soft* is dropped. The noun join `bal` closes *herb and leaf*, both under `ael`.
- **STC-169, 174, 176, *-self* as *unaided*:** the single-item **-l** join is *just* ([joins](../grammar/joins.md)): `zegehal gamazam zal` is *only the little girl*, so nobody else did it. It also gives *alone* (STC-176).
- **STC-170, 171, 173, 175, reflexives:** a resume in the object or recipient slot points back at the subject ([pronouns](../grammar/pronouns.md#resume-r)). *Ashamed of myself* is unmet relatedness aimed at oneself (`thonathumom bSELFr`). **STC-172:** *proved* is the *proof* abstract as a verb (`verazem`).
- **STC-177, *embroidered*, *princess*:** no subject, with *sew* from *needle* (`venedal`). *Princess* is *small girl* with *leadership* (`gagawum`). *National flower of the Country* is a second sentence: `gabom bagul` (*country*, 🗾).
- **STC-178, *symbol of liberty*:** *symbols* (`gezezul`) with *about* (`gahehom`) and the *liberty* abstract on *statue*.
- **STC-179, *with him as our protector*:** `han bazawan gagadul em bamegunx` (including Azawan the guard). *No danger* is `dogozom dul`.
- **STC-180, *finery … packed*:** *finery* is *embellishment*; lace, ribbons, and feathers are dropped. *Trunk* is *luggage* (`balagal`), *packed away* is *carry* (`valagal`), and the subject is left out.
- **STC-181, *light … like a feather*:** `darl` and a second sentence. *Light* is *less heavy than the Some-sake bar*.
- **STC-182, *cousins*, *long visit*:** cousin is a child of a sibling of a parent: three kin anchors (`grebawol bebezal grebazol bebezal grebuwol bamegunx`). *Long* is `hadaham`; *pay a visit* is *attend* with the visited as object.
- **STC-183, *climate*, *remains*:** `zual` + kind + `/ɡ/` is a property of every member (STC-84); *remains* is `hagem`; *climate* is *weather* (`bogom`).
- **STC-184–187, relative clauses:** two sentences with a resume. *Brought* is *carry*; *ordered* is *consumption* (`vagagum`, from *cart*), so *bought*. **STC-187:** the fisherman's own event comes first (`vegabem`, *own*), then the doer resume `zaxegaber` ([roles](../grammar/roles.md#this-instance-r)), and *demanded payment* is `vern` with *money given*.
- **STC-188–190:** `hehum barl` is *when*, `thodom barl` is *if*. *Stop* is `vazadal`; *called* is *summoned* (`vobozem`).

Findings (stopping points) are logged in [syntax-test-results](syntax-test-results.md).

## Source list

1. The sun shines.
2. The sun is shining.
3. The sun shone.
4. The sun will shine.
5. The sun has been shining.
6. The sun is shining again.
7. The sun will shine tomorrow.
8. The sun shines brightly.
9. The bright sun shines.
10. The sun is rising now.
11. All the people shouted.
12. Some of the people shouted.
13. Many of the people shouted twice.
14. Happy people often shout.
15. The kitten jumped up.
16. The kitten jumped onto the table.
17. My little kitten walked away.
18. It's raining.
19. The rain came down.
20. The kitten is playing in the rain.
21. The rain has stopped.
22. Soon the rain will stop.
23. I hope the rain stops soon.
24. Once wild animals lived here.
25. Slowly she looked around.
26. Go away!
27. Let's go!
28. You should go.
29. I will be happy to go.
30. He will arrive soon.
31. The baby's ball has rolled away.
32. The two boys are working together.
33. This mist will probably clear away.
34. Lovely flowers are growing everywhere.
35. We should eat more slowly.
36. You have come too soon.
37. You must write more neatly.
38. Directly opposite stands a wonderful palace.
39. Henry's dog is lost.
40. My cat is black.
41. The little girl's doll is broken.
42. I usually sleep soundly.
43. The children ran after Jack.
44. I can play after school.
45. We went to the village for a visit.
46. We arrived at the river.
47. I have been waiting for you.
48. The campers sat around the fire.
49. A little girl with a kitten sat near me.
50. The child waited at the door for her father.
51. Yesterday the oldest girl in the village lost her kitten.
52. Were you born in this village?
53. Can your brother dance well?
54. Did the man leave?
55. Is your sister coming for you?
56. Can you come tomorrow?
57. Have the neighbors gone away for the winter?
58. Does the robin sing in the rain?
59. Are you going with us to the concert?
60. Have you ever travelled in the jungle?
61. We sailed down the river for several miles.
62. Everybody knows about hunting.
63. On a Sunny morning after the solstice we started for the mountains.
64. Tom laughed at the monkey's tricks.
65. An old man with a walking stick stood beside the fence.
66. The squirrel's nest was hidden by drooping boughs.
67. The little seeds waited patiently under the snow for the warm spring sun.
68. Many little girls with wreaths of flowers on their heads danced around the bonfire.
69. The cover of the basket fell to the floor.
70. The first boy in the line stopped at the entrance.
71. On the top of the hill in a little hut lived a wise old woman.
72. During our residence in the country we often walked in the pastures.
73. When will your guests from the city arrive?
74. Near the mouth of the river, its course turns sharply towards the East.
75. Between the two lofty mountains lay a fertile valley.
76. Among the wheat grew tall red poppies.
77. The strong roots of the oak trees were torn from the ground.
78. The sun looked down through the branches upon the children at play.
79. The west wind blew across my face like a friendly caress.
80. The spool of thread rolled across the floor.
81. A box of growing plants stood in the Window.
82. I am very happy.
83. These oranges are juicy.
84. Sea water is salty.
85. The streets are full of people.
86. Sugar tastes sweet.
87. The fire feels hot.
88. The little girl seemed lonely.
89. The little boy's father had once been a sailor.
90. I have lost my blanket.
91. A robin has built his nest in the apple tree.
92. At noon we ate our lunch by the roadside.
93. Mr. Jones made a knife for his little boy.
94. Their voices sound very happy.
95. Is today Monday?
96. Have all the leaves fallen from the tree?
97. Will you be ready on time?
98. Will you send this message for me?
99. Are you waiting for me?
100. Is this the first kitten of the litter?
101. Are these shoes too big for you?
102. How wide is the River?
103. Listen.
104. Sit here by me.
105. Keep this secret until tomorrow.
106. Come with us.
107. Bring your friends with you.
108. Be careful.
109. Have some tea.
110. Pip and his dog were great friends.
111. John and Elizabeth are brother and sister.
112. You and I will go together.
113. They opened all the doors and windows.
114. He is small, but strong.
115. Is this tree an oak or a maple?
116. Does the sky look blue or gray?
117. Come with your father or mother.
118. I am tired, but very happy.
119. He played a tune on his wonderful flute.
120. Toward the end of August the days grow much shorter.
121. A company of soldiers marched over the hill and across the meadow.
122. The first part of the story is very interesting.
123. The crow dropped some pebbles into the pitcher and raised the water to the brim.
124. The baby clapped her hands and laughed in glee.
125. Stop your game and be quiet.
126. The sound of the drums grew louder and louder.
127. Do you like summer or winter better?
128. That boy will have a wonderful trip.
129. They popped corn, and then sat around the fire and ate it.
130. They won the first two games, but lost the last one.
131. Take this note, carry it to your mother; and wait for an answer.
132. I awoke early, dressed hastily, and went down to breakfast.
133. Aha! I have caught you!
134. This string is too short!
135. Oh, dear! the wind has blown my hat away!
136. Alas! that news is sad indeed!
137. Whew! that cold wind freezes my nose!
138. Are you warm enough now?
139. They heard the warning too late.
140. We are a brave people, and love our country.
141. All the children came except Mary.
142. Jack seized a handful of pebbles and threw them into the lake.
143. This cottage stood on a low hill, at some distance from the village.
144. On a fine summer evening, the two old people were sitting outside the door of their cottage.
145. Our bird's name is Jacko.
146. The river knows the way to the sea.
147. The boat sails away, like a bird on the wing.
148. They looked cautiously about, but saw nothing.
149. The little house had three rooms, a sitting room, a bedroom, and a tiny kitchen.
150. We visited my uncle's village, the largest village in the world.
151. We learn something new each day.
152. The market begins five minutes earlier this week.
153. Did you find the distance too great?
154. Hurry, children.
155. Madam, I will obey your command.
156. Here under this tree they gave their guests a splendid feast.
157. In winter I get up at night, and dress by yellow candlelight.
158. Tell the last part of that story again.
159. Be quick or you will be too late.
160. Will you go with us or wait here?
161. She was always, shabby, often ragged, and on cold days very uncomfortable.
162. Think first and then act.
163. I stood, a little mite of a girl, upon a chair by the window, and watched the falling snowflakes.
164. Show the guests these shells, my son, and tell them their strange history.
165. Be satisfied with nothing but your best.
166. We consider them our faithful friends.
167. We will make this place our home.
168. The squirrels make their nests warm and snug with soft moss and leaves.
169. The little girl made the doll's dress herself.
170. I hurt myself.
171. She was talking to herself.
172. He proved himself trustworthy.
173. We could see ourselves in the water.
174. Do it yourself.
175. I feel ashamed of myself.
176. Sit here by yourself.
177. The dress of the little princess was embroidered with roses, the national flower of the Country.
178. They wore red caps, the symbol of liberty.
179. With him as our protector, we fear no danger.
180. All her finery, lace, ribbons, and feathers, was packed away in a trunk.
181. Light he thought her, like a feather.
182. Every spring and fall our cousins pay us a long visit.
183. In our climate the grass remains green all winter.
184. The boy who brought the book has gone.
185. These are the flowers that you ordered.
186. I have lost the book that you gave me.
187. The fisherman who owned the boat now demanded payment.
188. Come when you are called.
189. I shall stay at home if it rains.
190. When he saw me, he stopped.
191. Do not laugh at me because I seem so absent minded.
192. I shall lend you the books that you need.
193. Come early next Monday if you can.
194. If you come early, wait in the hall.
195. I had a younger brother whose name was Antonio.
196. Gnomes are little men who live under the ground.
197. He is loved by everybody, because he has a gentle disposition.
198. Hold the horse while I run and get my cap.
199. I have found the ring I lost.
200. Play and I will sing.
201. That is the funniest story I ever heard.
202. She is taller than her brother.
203. They are no wiser than we.
204. Light travels faster than sound.
205. We have more time than they.
206. She has more friends than enemies.
207. He was very poor, and with his wife and five children lived in a little low cabin of logs and stones.
208. When the wind blew, the traveler wrapped his mantle more closely around him.
209. I am sure that we can go.
210. We went back to the place where we saw the roses.
211. "This tree is fifty feet high," said the gardener.
212. I think that this train leaves five minutes earlier today.
213. My opinion is that the governor will grant him a pardon.
214. Why he has left the city is a mystery.
215. The house stands where three roads meet.
216. He has far more money than brains.
217. Evidently that gate is never opened, for the long grass and the great hemlocks grow close against it.
218. I met a little cottage girl; she was eight years old, she said.
