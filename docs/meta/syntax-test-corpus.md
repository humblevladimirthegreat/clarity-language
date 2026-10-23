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

Before logging a grammar gap:

1. Run `node scripts/find-english.mjs '<phrase>'` on the English and on one or two rewordings.
2. Try the recurring fixes: a resume hook (`er` / `or` / `ar` / `ur`), counting from the end (`gruodol`), the discourse hooks (`aol` / `ael`), and a time pole plus PLAN.
3. If the English puts a feeling, belief, want or other stance on **someone other than the speaker** (*she was hurt*, *he thinks*, *it makes sense that you feel*), it is almost never a gap. This has been logged as one several times. Name that person as the holder on the channel, MAY or NOTIONAL word that gives you access to their view (`theyomazozon`, `thebamawan`, `theyoleyer`: [whose view](/holder#holder)). For a stance **on** their stance, put your stance in the main sentence and theirs in a dependent with its own holder seam word, naming what their feeling is about (`wowetham goyom zarl zevur wawethumam goyom theyomawan`).
4. Record the phrases you tried in the gap row.

Every Ageben line below was checked with `node scripts/parse.mjs`.

## Translations

| STC | English | Ageben | Morph gloss | Verdict |
|-----|---------|--------|-------------|---------|
| 1 | The sun shines. | `zezalor vubalel.` | z-←sun \| v-shine | covered |
| 2 | The sun is shining. | `zezalor thugem vubalel.` | z-←sun \| th-LIVE \| v-shine | covered |
| 3 | The sun shone. | `zezalor thevum vubalel.` | z-←sun \| th-MEMORY \| v-shine | covered |
| 4 | The sun will shine. | `zezalor thubom blral vubalel.` | z-←sun \| [th-PATTERN \| b-later] \| v-shine | covered |
| 5 | The sun has been shining. | `zezalor thugem hawum vubalel.` | z-←sun \| th-LIVE \| h-still \| v-shine | covered |
| 6 | The sun is shining again. | `zezalor thugem herugom vubalel.` | z-←sun \| th-LIVE \| h-again \| v-shine | covered |
| 7 | The sun will shine tomorrow. | `zezalor thubom blazurom grabal vubalel.` | z-←sun \| [th-PATTERN \| [b-day \| g-one]] \| v-shine | covered |
| 8 | The sun shines brightly. | `zezalor hubalel vubalel.` | z-←sun \| h-bright \| v-shine | covered |
| 9 | The bright sun shines. | `zezalor gubalel vubalel.` | [z-←sun \| g-bright] \| v-shine | covered |
| 10 | The sun is rising now. | `zezalor thugem vabuhom.` | z-←sun \| th-LIVE \| v-rise | covered |
| 11 | All the people shouted. | `zual geyel thevum vezuwal.` | [z-everything \| g-person] \| th-MEMORY \| v-shout | covered |
| 12 | Some of the people shouted. | `zeyerx gram thevum vezuwal.` | [z-←person-x \| g-more-than-one.about] \| th-MEMORY \| v-shout | covered |
| 13 | Many of the people shouted twice. | `zeyerx thubom zol gral thevum vezuwal hradol.` | [z-←person-x \| th-PATTERN \| z-rank/more \| g-amount] \| th-MEMORY \| v-shout \| h-two | covered |
| 14 | Happy people often shout. | `zeyelx gugomam thubom zol hral vezuwal.` | [[z-person-x \| g-delight] \| th-PATTERN \| z-rank/more \| h-how-often] \| v-shout | by design (G-01) |
| 15 | The kitten jumped up. | `zeboyoxogozer thevum vunazal habuhom.` | z-baby-x-cat \| th-MEMORY \| v-jump \| h-rise | covered |
| 16 | The kitten jumped onto the table. | `zeboyoxogozer thevum vunazal ael bedohel.` | z-baby-x-cat \| th-MEMORY \| v-jump \| [on \| b-table] | covered |
| 17 | My little kitten walked away. | `glamezem zeboyoxogozel om buwen thevum vowurolum.` | `[gl-small \| z-baby-x-cat \| [used-by \| b-speaker]] \| th-MEMORY \| v-recede` | covered |
| 18 | It's raining. | `thugem verulal.` | th-LIVE \| v-rain | covered |
| 19 | The rain came down. | `zerulal thevum voduhol.` | z-rain \| th-MEMORY \| v-fall | covered |
| 20 | The kitten is playing in the rain. | `zeboyoxogozer thugem veboham am berulal.` | z-baby-x-cat \| th-LIVE \| v-play \| [amid \| b-rain] | covered |
| 21 | The rain has stopped. | `thugem huvum verulal.` | th-LIVE \| h-no-longer \| v-rain | covered |
| 22 | Soon the rain will stop. | `theyom blrawum huvum verulal.` | [th-CLUES \| b-+-e-.about] \| h-no-longer \| v-rain | covered |
| 23 | I hope the rain stops soon. | `thuwuyom theyom blrawum huvum verulal.` | th-hope \| [th-CLUES \| b-+-e-.about] \| h-no-longer \| v-rain | covered |
| 24 | Once wild animals lived here. | `zulazulx gulazum em buwen helam voheham.` | `[z-leopard-x \| g-nature \| [near \| b-speaker]] \| h-FORMER \| v-home` | covered |
| 25 | Slowly she looked around. | `huzezam zalazun thevum vezebem el bual.` | h-slow \| z-Alazun \| th-MEMORY \| v-look \| [at \| b-everything] | covered |
| 26 | Go away! | `yol vavobolum.` | y-command \| v-go-recede | covered |
| 27 | Let's go! | `yom zayan vavobol.` | y-request \| z-interlocutors \| v-go | covered |
| 28 | You should go. | `zawan vavobol thudathem.` | z-listener \| v-go \| th-sake-ought-offered | covered |
| 29 | I will be happy to go. | `zuwen thagom vavobol thodethamam.` | z-speaker \| th-plan-itinerary \| v-go \| th-pleasure-met-any-term-INTERNAL-FLOWING | covered |
| 30 | He will arrive soon. | `zazozon theyom blrawum vevorol.` | z-Azozon \| [th-CLUES \| b-+-e-.about] \| v-arrival | covered |
| 31 | The baby's ball has rolled away. | `zobovel om beboyol haram vuwovolum.` | `[z-ball \| [used-by \| b-baby]] \| h-RESIDUE \| v-wheel-recede` | covered |
| 32 | The two boys are working together. | `zoboyolx gradol thugem vuzubamx.` | [z-boy-x \| g-two] \| th-LIVE \| v-effort-x | covered |
| 33 | This mist will probably clear away. | `zovulul em buwen thral theyom blral vememulum.` | `[z-fog \| [near \| b-speaker]] \| th-likely \| [th-CLUES \| bl-later] \| v-melt-recede` | covered |
| 34 | Lovely flowers are growing everywhere. | `zevelalx gahelam thugem velom el bual.` | [z-flower-x \| g-beauty] \| th-LIVE \| v-growth \| [at \| b-everything] | covered |
| 35 | We should eat more slowly. | `zayan thubom zol huzezam vagedal thudathem.` | [z-interlocutors \| th-PATTERN \| z-rank/more \| h-slow] \| v-eat \| th-sake-ought-offered | covered |
| 36 | You have come too soon. | `zawan thudatham zuol bral vavobol oel buwen.` | [z-listener \| th-sake-met-any-term \| z-rank/less \| b-later] \| v-go \| [toward \| b-speaker] | covered |
| 37 | You must write more neatly. | `zawan thubom zol hozebum varuyol hwuvom.` | [z-listener \| th-PATTERN \| z-rank/more \| h-cleanliness] \| v-write \| h-episode-event-REQUIRE-said | covered |
| 38 | Directly opposite stands a wonderful palace. | `honuhothayan zugahul gemem vuzuvel.` | h-north-th-interlocutors \| [z-castle \| g-amazement] \| v-stand | covered |
| 39 | Henry's dog is lost. | `zodozel galurum om bazozon.` | `[z-dog \| g-loss \| [used-by \| b-Azozon]]` | covered |
| 40 | My cat is black. | `zogozel gubulel om buwen.` | `[z-cat \| g-black \| [used-by \| b-speaker]]` | covered |
| 41 | The little girl's doll is broken. | `zeneval gelahum om boyoyol gamezem.` | `[z-nesting-doll \| g-breakdown \| [used-by \| [b-girl \| g-small]]]` | covered |
| 42 | I usually sleep soundly. | `zuwen huam vezuvel honedum.` | z-speaker \| h-always.open \| v-sleep \| h-depth | covered |
| 43 | The children ran after Jack. | `zohoyolx thevum dahelan vohunom.` | z-child-x \| th-MEMORY \| d-Ahelan \| v-pursuit | covered |
| 44 | I can play after school. | `zuwen vebohaxam halam bluzahal.` | z-speaker \| v-play-able \| [h-after \| b-school] | covered |
| 45 | We went to the village for a visit. | `zayan thevum vavobol oel bahaham hovam blowurolol.` | z-interlocutors \| th-MEMORY \| v-go \| [toward \| b-locality] \| [h-so-that \| b-attend] | covered |
| 46 | We arrived at the river. | `zayan thevum vevorol el bowulal.` | `z-interlocutors \| th-MEMORY \| v-arrival \| [at \| b-water]` | covered |
| 47 | I have been waiting for you. | `zuwen thugem hawum dawan vabahom.` | z-speaker \| th-LIVE \| h-still \| d-listener \| v-wait | covered |
| 48 | The campers sat around the fire. | `zwuzagahalx thevum vehohel hevam blavulul.` | `z-episode-agent-camp-x \| th-MEMORY \| v-sit \| [h-around \| bl-fire]` | covered |
| 49 | A little girl with a kitten sat near me. | `glamezem zoyoyol gan bleboyoxogozel thevum vehohel om buwen.` | [gl-small \| z-girl \| [g-including \| b-baby-x-cat]] \| th-MEMORY \| v-sit \| [near \| b-speaker] | covered |
| 50 | The child waited at the door for her father. | `zohoyor thevum vabahom el bohel glemugel deyel growubal blohoyor.` | `z-←child \| th-MEMORY \| v-wait \| [at \| b-door] \| [gl-male \| d-person \| [g-#-e-1 \| bl-←←child]]` | covered |
| 51 | Yesterday the oldest girl in the village lost her kitten. | `zoyoyol zol guburom al bahaham thevum blazurom grubal deboyoxogozel om boyoyor valurum.` | `[z-girl \| z-rank/more \| g-age] \| [in \| b-locality] \| [th-MEMORY \| [bl-day \| g-minus-one]] \| [d-baby-x-cat \| [used-by \| b-←girl]] \| v-loss` | covered |
| 52 | Were you born in this village? | `yel ? zawan al bahaham em buwen vavel.` | `y-question \| ? \| z-listener \| [in \| [b-locality \| [near \| b-speaker]]] \| v-hatch` | covered |
| 53 | Can your brother dance well? | `yel ? glemugel zeyel growamol blawan vunuroxal hebedem.` | `y-question \| [? \| gl-male \| z-person \| [g-#-e0 \| bl-listener]] \| v-dance-able \| h-excellence` | covered |
| 54 | Did the man leave? | `yel ? zamayor vudurul.` | y-question \| ? \| z-←man \| v-departure | covered |
| 55 | Is your sister coming for you? | `yel ? gluvugel zeyel growamol blawan vavobol oel bawan.` | `y-question \| [? \| gl-female \| z-person \| [g-#-e0 \| bl-listener]] \| v-go \| [toward \| b-listener]` | covered |
| 56 | Can you come tomorrow? | `yel ? zawan thagom blazurom grabal vavobol oel buwen.` | `y-question \| ? \| z-listener \| [th-plan-itinerary \| [bl-day \| g-one]] \| v-go \| [toward \| b-speaker]` | covered |
| 57 | Have the neighbors gone away for the winter? | `yel ? zwuzohehamx em bayan haram vavobolum herom blugebam.` | `y-question \| ? \| z-episode-agent-home-x \| [near \| b-interlocutors] \| h-RESIDUE \| v-go-recede \| [h-while \| bl-winter]` | covered |
| 58 | Does the robin sing in the rain? | `yel ? zuam geruloxebezel vozuyel am berulal.` | y-question \| [? \| z-everything.open \| g-red-x-bird] \| v-sing \| [amid \| b-rain] | covered |
| 59 | Are you going with us to the concert? | `yel ? zawan han bluwenx vavobol oel bozuyel.` | y-question \| ? \| z-listener \| [h-including \| bl-speaker-x] \| v-go \| [toward \| b-sing] | covered |
| 60 | Have you ever travelled in the jungle? | `yel ? zawan havem vahavam am boyaloxedalolx har.` | y-question \| ? \| z-listener \| h-already \| v-voyage \| [amid \| b-palm-x-tree-x] \| h-when | covered |
| 61 | We sailed down the river for several miles. | `zuwenx thevum blezerom grawagem vahaval uol bowulal.` | z-speaker-x \| [th-MEMORY \| [b-meter \| g-+-e3.about]] \| v-ship \| [through \| b-drinking-water] | covered |
| 62 | Everybody knows about hunting. | `zuam vanam hehugom bluwozum.` | z-everything.open \| v-knowledge \| [h-topic \| b-predation] | covered |
| 63 | On a Sunny morning after the solstice we started for the mountains. | `el banurom gezalol halam blezaloxezohul zuwenx thevum damahulx vavoboloel.` | `[at \| [b-dawn \| g-sun]] \| [h-after \| bl-sun-x-stop] \| z-speaker-x \| th-MEMORY \| d-mountain-x \| v-go-head-for` | covered |
| 64 | Tom laughed at the monkey's tricks. | `zamozal vadayum. zazozon thevum valamal el badayur.` | z-monkey \| v-mischief . z-Azozon \| th-MEMORY \| v-laugh \| [at \| b-←mischief] | covered |
| 65 | An old man with a walking stick stood beside the fence. | `zalayol gan blegowol thevum vuzuvel om bulolugohul.` | [z-old-man \| [g-including \| b-cane]] \| th-MEMORY \| v-stand \| [near \| b-fence] | covered |
| 66 | The squirrel's nest was hidden by drooping boughs. | `dunolal om bezezal thevum zedaloxobolx goduhol vohovam.` | `[d-nest \| [used-by \| b-squirrel]] \| th-MEMORY \| [z-tree-x-bone-x \| g-down] \| v-concealment` | covered |
| 67 | The little seeds waited patiently under the snow for the warm spring sun. | `glamezem zelolx hoduhol blozulal thevum halazam vabahom dezalol wamezem gohamul gerom blahelom.` | [gl-small \| z-seedling-x] \| [h-down \| b-snow] \| th-MEMORY \| h-composure \| v-wait \| [d-sun \| [w-small \| g-hot] \| [g-while \| b-spring]] | covered |
| 68 | Many little girls with wreaths of flowers on their heads danced around the bonfire. | `zoyoyolx gamezem gan blevelalegobolx thubom zol gral thevum vunurol hevam blavulul.` | `[[z-girl-x \| g-small \| [g-including \| bl-wreath-x]] \| th-PATTERN \| z-rank/more \| g-amount] \| th-MEMORY \| v-dance \| [h-around \| bl-fire]` | covered |
| 69 | The cover of the basket fell to the floor. | `zabuhol gobom blabowal thevum voduhol oel bohehalagulal.` | [z-up \| [g-part-of \| b-basket]] \| th-MEMORY \| v-fall \| [toward \| b-floor] | covered |
| 70 | The first boy in the line stopped at the entrance. | `zoboyol grobal thevum vezohul el bohel.` | [z-boy \| g-1st] \| th-MEMORY \| v-stop \| [at \| b-door] | covered |
| 71 | On the top of the hill in a little hut lived a wise old woman. | `ael bamahul theyum al bahahal gamezem voheham zolayol gelayom.` | [on \| b-mountain] \| th-NOTIONAL \| [in \| [b-hut \| g-small]] \| v-home \| [z-old-woman \| g-wisdom] | covered |
| 72 | During our residence in the country we often walked in the pastures. | `zuwenx thubom zol hral thevum vowurol am bevahalx herom blarl zuwenx voheham am begaham.` | `[z-speaker-x \| th-PATTERN \| z-rank/more \| h-how-often] \| th-MEMORY \| v-walk \| [amid \| b-field-x] \| [h-while \| bl-that-clause] \| z-speaker-x \| v-home \| [amid \| b-rural]` | covered |
| 73 | When will your guests from the city arrive? | `yel har glaham blazahom zeyelx gabodum blawan theyom blral vevorol.` | `y-question \| h-when \| [[gl-origin \| bl-urban] \| z-person-x \| [g-hospitality \| bl-listener]] \| [th-CLUES \| bl-later] \| v-arrival` | covered |
| 74 | Near the mouth of the river, its course turns sharply towards the East. | `om bamebal gobom blowulal zowular hanewum varugom oel bahol.` | [near \| [b-mouth \| [g-part-of \| b-drinking-water]]] \| z-←drinking-water \| h-severity \| v-turn \| [toward \| b-east] | covered |
| 75 | Between the two lofty mountains lay a fertile valley. | `hedam blamahulx gradol gadahom zoduhol gomelem.` | [h-between \| [b-mountain-x \| g-two \| g-height]] \| [z-down \| g-proliferation] | covered |
| 76 | Among the wheat grew tall red poppies. | `am bogelal thevum velom zevelalx gadahom gerulol.` | [amid \| b-grain] \| th-MEMORY \| v-growth \| [z-flower-x \| g-height \| g-red] | covered |
| 77 | The strong roots of the oak trees were torn from the ground. | `dedaloxevobolx gabobem gobom bluneduledalolx thevum habuvum vohugum ual bagulal.` | [d-tree-x-foot-x \| g-strength \| [g-part-of \| b-oak-x]] \| th-MEMORY \| h-force \| v-removal \| [out-of \| b-ground] | covered |
| 78 | The sun looked down through the branches upon the children at play. | `zezalor thevum hoduhol uel bedaloxobolx vezebem el bohoyolx gwuzeboham.` | z-←sun \| th-MEMORY \| h-down \| [through \| b-tree-x-bone-x] \| v-look \| [at \| [b-child-x \| g-episode-agent-recreation]] | covered |
| 79 | The west wind blew across my face like a friendly caress. | `zawulol gewuhol thevum vawulol hohom blovemel om buwen hewem blahuyal gazamam.` | `[z-wind \| g-west] \| th-MEMORY \| v-wind \| [h-across \| [bl-face \| [used-by \| b-speaker]]] \| [h-like \| [bl-hug \| g-goodwill]]` | covered |
| 80 | The spool of thread rolled across the floor. | `zayulal thevum vuwovol hohom blohehalagulal.` | z-yarn \| th-MEMORY \| v-wheel \| [h-across \| b-floor] | covered |
| 81 | A box of growing plants stood in the Window. | `zubogal gadam blabolelx gwuzelom thevum vuzuvel al buwohel.` | `[z-box \| [g-contents \| [bl-plant-x \| g-episode-agent-growth]]] \| th-MEMORY \| v-stand \| [in \| b-window]` | covered |
| 82 | I am very happy. | `welazem thodethamam.` | [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] | covered |
| 83 | These oranges are juicy. | `zadederx guhudal em buwen.` | `[z-←tangerine-x \| g-juice \| [near \| b-speaker]]` | covered |
| 84 | Sea water is salty. | `zuam gohalaxowulal gozudal.` | [z-everything.open \| g-ocean-x-drinking-water] \| g-salt | covered |
| 85 | The streets are full of people. | `zeyelx thubom zol gral al boraholx.` | [z-person-x \| th-PATTERN \| z-rank/more \| g-amount] \| [in \| b-road-x] | covered |
| 86 | Sugar tastes sweet. | `zual gunedam godem thubom.` | [z-everything \| g-sugar] \| g-sweetness \| th-PATTERN | covered |
| 87 | The fire feels hot. | `zavulur gohamul thugem.` | [z-←fire \| g-hot] \| th-LIVE | covered |
| 88 | The little girl seemed lonely. | `thawethumam theyomoyoyor.` | th-relatedness-unmet-modifiable-INTERNAL-FLOWING \| th-CLUES-←girl | by design (G-01) |
| 89 | The little boy's father had once been a sailor. | `glemugel zeyel gwozahaval growubal bloboyol gamezem helam.` | `[gl-male \| z-person \| g-role-agent-ship \| [g-#-e-1 \| [bl-boy \| g-small]]] \| h-FORMER` | covered |
| 90 | I have lost my blanket. | `zuwen haram dayulam om buwen valurum.` | `z-speaker \| h-RESIDUE \| [d-blanket \| [used-by \| b-speaker]] \| v-loss` | covered |
| 91 | A robin has built his nest in the apple tree. | `zeruloxebezel haram dunolal voguyol al baledexedalol.` | z-red-x-bird \| h-RESIDUE \| d-nest \| v-construct \| [in \| b-apple-x-tree] | covered |
| 92 | At noon we ate our lunch by the roadside. | `h_12 zuwenx thevum denodal em buwenx vagedal om borahol.` | h-_12 \| z-speaker-x \| th-MEMORY \| [d-bento \| [used-by \| b-speaker-x]] \| v-eat \| [near \| b-road] | covered |
| 93 | Mr. Jones made a knife for his little boy. | `zahelan thevum danewul vomuyal ol boboyol gamezem growabal blahelar.` | `z-Ahelan \| th-MEMORY \| d-knife \| v-manufacture \| [for \| [b-boy \| g-small \| [g-#-e1 \| bl-←Ahelan]]]` | covered |
| 94 | Their voices sound very happy. | `welazem thodethamam thugemeyerx.` | [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] \| th-LIVE-←person-x | covered |
| 95 | Is today Monday? | `yel ? zolerom grobal thugem.` | y-question \| [? \| z-weekday \| g-1st] \| th-LIVE | covered |
| 96 | Have all the leaves fallen from the tree? | `yel ? zual golelel ul bedalol havem voduhol.` | y-question \| [? \| z-everything \| g-leaf] \| [from \| b-tree] \| h-already \| v-fall | covered |
| 97 | Will you be ready on time? | `yel ? zawan theyom blral vabam hawerom.` | `y-question \| ? \| z-listener \| [th-CLUES \| bl-later] \| v-preparation \| h-punctuality` | covered |
| 98 | Will you send this message for me? | `yom zawan demunam em buwen voboham hanem bluwen.` | `y-request \| z-listener \| [d-message \| [near \| b-speaker]] \| v-dispatch \| [h-on-behalf-of \| bl-speaker]` | covered |
| 99 | Are you waiting for me? | `yel ? zawan duwen vabahom.` | y-question \| ? \| z-listener \| d-speaker \| v-wait | covered |
| 100 | Is this the first kitten of the litter? | `yel ? zeboyoxogozer g#1e0 em buwen.` | `y-question \| [? \| z-baby-x-cat \| g-#-1e0 \| [near \| b-speaker]]` | covered |
| 101 | Are these shoes too big for you? | `yel ? zuhobarx thudatham blawan zol gelazem.` | `y-question \| [? \| z-←shoe-x \| [th-sake-met-any-term \| bl-listener] \| z-rank/more \| g-big]` | covered |
| 102 | How wide is the River? | `yel zowular wrar gagoram.` | `y-question \| z-←water \| [w-how-many \| g-width]` | covered |
| 103 | Listen. | `yol vebam.` | `y-command \| v-hearsay` | covered |
| 104 | Sit here by me. | `yol vehohel om buwen.` | y-command \| v-sit \| [near \| b-speaker] | covered |
| 105 | Keep this secret until tomorrow. | `yol darth vuhamum harum blazurom grabal.` | `y-command \| d-that-same-claim \| v-confidentiality \| [h-until \| [bl-day \| g-one]]` | covered |
| 106 | Come with us. | `yol han bluwenx vavobol.` | `y-command \| [h-including \| bl-speaker-x] \| v-go` | covered |
| 107 | Bring your friends with you. | `yol han bleyelx gamayam blawan vavobol oel buwen.` | `y-command \| [h-including \| [bl-person-x \| [g-companionship \| bl-listener]]] \| v-go \| [toward \| b-speaker]` | covered |
| 108 | Be careful. | `yol guyulom.` | y-command \| g-caution | covered |
| 109 | Have some tea. | `yom dedudal gral vuwudal.` | y-request \| [d-tea \| g-more-than-one] \| v-drink | covered |
| 110 | Pip and his dog were great friends. | `zazozon zodozel om bazozor zal welazem gamayam thevum.` | [z-Azozon \| [z-dog \| [used-by \| b-←Azozon]] \| z-and \| [w-very \| g-companionship]] \| th-MEMORY | awkward (G-17) |
| 111 | John and Elizabeth are brother and sister. | `zazozon gemugel zalazun guvugel zal growamol.` | [[z-Azozon \| g-male] \| [z-Alazun \| g-female] \| z-and \| g-#-e0] | awkward (G-17) |
| 112 | You and I will go together. | `zayan thagom vavobolx.` | z-interlocutors \| th-plan-itinerary \| v-go-x | covered |
| 113 | They opened all the doors and windows. | `zeyelx thevum dual gohel vohel xal zeyerx dual guwohel vohel.` | [z-person-x \| th-MEMORY \| [d-everything \| g-door] \| v-open \| x-and \| z-←person-x-x \| [d-everything \| g-window] \| v-open] | covered |
| 114 | He is small, but strong. | `zazozon gamezem. xugohum zazozor gabobem.` | z-Azozon \| g-small . x-but \| z-←Azozon \| g-strength | covered |
| 115 | Is this tree an oak or a maple? | `yel zedalor guneduledalol gemalol ?gar.` | y-question \| z-←tree \| [g-oak \| g-maple \| ?g-wh] | covered |
| 116 | Does the sky look blue or gray? | `yel zugalam gobulol gagulel ?gar thugem.` | `y-question \| [z-sky \| [g-blue \| g-gray \| ?g-wh]] \| th-LIVE` | covered |
| 117 | Come with your father or mother. | `yol han bleyel growubal blawan vavobol oel buwen.` | `y-command \| [h-including \| [bl-person \| [g-#-e-1 \| bl-listener]]] \| v-go \| [toward \| b-speaker]` | covered |
| 118 | I am tired, but very happy. | `zuwen gadamul. xugohum welazem thodethamam.` | z-speaker \| g-tired . x-but \| [w-very \| th-pleasure-met-any-term-INTERNAL-FLOWING] | covered |
| 119 | He played a tune on his wonderful flute. | `zazozon thevum dudurol vuwem aol buvorol gemem om bazozor.` | `z-Azozon \| th-MEMORY \| d-tune \| v-performance \| [using \| [b-flute \| g-amazement \| [used-by \| b-←Azozon]]]` | covered |
| 120 | Toward the end of August the days grow much shorter. | `om b_#31,8 zazuromx thubom zuol welazem godurom thubom.` | [near \| b-_31,8] \| [z-day-x \| th-PATTERN \| z-rank/less \| [w-very \| g-duration]] \| th-PATTERN | covered |
| 121 | A company of soldiers marched over the hill and across the meadow. | `aem bamahul gamezem zagayulx thevum vowurolx hohom blegudalx.` | `[over \| [b-mountain \| g-small]] \| z-guard-x \| th-MEMORY \| v-walk-x \| [h-across \| bl-greens-x]` | covered |
| 122 | The first part of the story is very interesting. | `zebugor welazem gogozem gobom blonom.` | [z-←begin \| [w-very \| g-curiosity] \| [g-part-of \| b-tale]] | covered |
| 123 | The crow dropped some pebbles into the pitcher and raised the water to the brim. | `zubulexebezel thevum darolelx gamezem voduhol al bomodal xan zubulexebezer dowular vabuhol oel babuhol gobom blomodar.` | [z-black-x-bird \| th-MEMORY \| [d-rock-x \| g-small] \| v-fall \| [in \| b-amphora] \| x-and-then \| z-←black-x-bird \| d-←drinking-water \| v-up \| [toward \| [b-up \| [g-part-of \| b-←amphora]]]] | covered |
| 124 | The baby clapped her hands and laughed in glee. | `zeboyor thevum vaguyal valamal val hugomam.` | z-←baby \| th-MEMORY \| [v-clap \| v-laugh \| v-and \| h-delight] | covered |
| 125 | Stop your game and be quiet. | `yol huvum veboham xal gozemem.` | y-command \| [h-no-longer \| v-play \| x-and \| g-silence] | covered |
| 126 | The sound of the drums grew louder and louder. | `zadowel gaham bladoralx thevum hugowum vayurol.` | [z-audio \| [g-origin \| b-drum-x]] \| th-MEMORY \| h-volume \| v-uptrend | covered |
| 127 | Do you like summer or winter better? | `yel zawan dazedam dugebam ?dor volamam.` | y-question \| z-listener \| [d-summer \| d-winter \| ?d-which-rank] \| v-cherished | covered |
| 128 | That boy will have a wonderful trip. | `zoboyor theyom blral vahavam hemem.` | z-←boy \| [th-CLUES \| b-later] \| v-voyage \| h-amazement | covered |
| 129 | They popped corn, and then sat around the fire and ate it. | `zeyelx thevum dabedal vugudol xan zeyerx vehohel hevam blavulul xan zeyerx dabedar vagedal.` | [z-person-x \| th-MEMORY \| d-popcorn \| v-cooking \| x-and-then \| z-←person-x-x \| v-sit \| [h-around \| b-fire] \| x-and-then \| z-←person-x-x \| d-←popcorn \| v-eat] | covered |
| 130 | They won the first two games, but lost the last one. | `zeyelx thevum duzehamx g#1 al g#2 veverol. xugohum zeyerx duzeham g#-1 valurum.` | z-person-x \| th-MEMORY \| [d-contest-x \| g-1st.short] \| through \| g-2nd.short \| v-victory . x-but \| z-←person-x-x \| [d-contest \| g-1st-from-end.short] \| v-loss | covered |
| 131 | Take this note, carry it to your mother; and wait for an answer. | `yol demunam em buwen velobal oel beyel guvugel growubal blawan xal vabahom dezuyom.` | `y-command \| [[d-message \| [near \| b-speaker]] \| v-carry \| [toward \| [b-person \| g-female \| [g-#-e-1 \| bl-listener]]] \| x-and \| v-wait \| d-discourse]` | covered |
| 132 | I awoke early, dressed hastily, and went down to breakfast. | `zuwen thubom zuol bral thevum vabuhol xan zuwen hadurom vedobal xan zuwen vavobol hoduhol oel benodal ganurom.` | [[z-speaker \| th-PATTERN \| z-rank/less \| b-later] \| th-MEMORY \| v-up \| x-and-then \| z-speaker \| h-haste \| v-dress \| x-and-then \| z-speaker \| v-go \| h-down \| [toward \| [b-bento \| g-dawn]]] | covered |
| 133 | Aha! I have caught you! | `!yalulun. zuwen haram dawan vamewul.` | !y-Alulun . z-speaker \| h-RESIDUE \| d-listener \| v-mousetrap | covered |
| 134 | This string is too short! | `! zovular em buwen thudatham zuol guravam.` | [[! \| z-←thread \| [near \| b-speaker]] \| th-sake-met-any-term \| z-rank/less \| g-length] | covered |
| 135 | Oh, dear! the wind has blown my hat away! | `!yewemun. zawulor haram dazobul om buwen vawulolum.` | `!y-Ewemun . z-←wind \| h-RESIDUE \| [d-sun-hat \| [used-by \| b-speaker]] \| v-wind-recede` | covered |
| 136 | Alas! that news is sad indeed! | `!yagamun. zunonar wawethumam goyom.` | !y-Agamun . z-←newspaper \| [w-relatedness-unmet-modifiable-INTERNAL-FLOWING \| g-stimulus] | covered |
| 137 | Whew! that cold wind freezes my nose! | `!yuvumen. zawulor gogomul donebel gobom bluwen vuzulel.` | !y-Uvumen . [z-←wind \| g-cold] \| [d-nose \| [g-part-of \| b-speaker]] \| v-ice | covered |
| 138 | Are you warm enough now? | `yel ? zawan thudatham zoel gohamul thabem blagorum gramol.` | `y-question \| [? \| z-listener \| th-sake-met-any-term \| z-equal-rank \| g-hot] \| [th-INTUITION \| [bl-hour \| g-zero]]` | covered |
| 139 | They heard the warning too late. | `zeyelx thudatham zol bral thevum dewugul vebal.` | [z-person-x \| th-sake-met-any-term \| z-rank/more \| b-later] \| th-MEMORY \| d-warning \| v-hear | covered |
| 140 | We are a brave people, and love our country. | `zuwenx galazum xal zuwenx dahal om buwenx volamal.` | `[z-speaker-x \| g-courage \| x-and \| z-speaker-x \| [d-country \| [used-by \| b-speaker-x]] \| v-love]` | covered |
| 141 | All the children came except Mary. | `zual gohoyol ul zalazun thevum vevorol.` | [z-everything \| g-child] \| except \| z-Alazun \| th-MEMORY \| v-arrival | covered |
| 142 | Jack seized a handful of pebbles and threw them into the lake. | `zahelan thevum dahebal gadam blarolelx gamezem vovebel xan zahelar darolerx vobovol al begavom.` | [z-Ahelan \| th-MEMORY \| [d-hand \| [g-contents \| [b-rock-x \| g-small]]] \| v-fist \| x-and-then \| z-←Ahelan \| d-←rock-x-x \| v-throw \| [in \| b-lake]] | covered |
| 143 | This cottage stood on a low hill, at some distance from the village. | `zegahar theyum vuzuvel ael bamahul gamezem um bahaham.` | z-←cottage \| th-NOTIONAL \| v-stand \| [on \| [b-mountain \| g-small]] \| [away-from \| b-locality] | covered |
| 144 | On a fine summer evening, the two old people were sitting outside the door of their cottage. | `el badurul gahelam gerom blazedam zeyelx gradol galayom theyum vehohel el bohel gobom blegahal om beyerx.` | `[at \| [b-dusk \| g-beauty \| [g-while \| bl-summer]]] \| [z-person-x \| g-two \| g-elderhood] \| th-NOTIONAL \| v-sit \| [at \| [b-door \| [g-part-of \| bl-cottage] \| [used-by \| b-←person-x-x]]]` | covered |
| 145 | Our bird's name is Jacko. | `zebezel om buwenx. zebezer gorel blahelan.` | `[z-bird \| [used-by \| b-speaker-x]] . z-←bird \| [g-SAME \| bl-Ahelan]` | covered |
| 146 | The river knows the way to the sea. | `zowular dorahol oel bohalal vanam.` | z-←drinking-water \| d-road \| [toward \| b-ocean] \| v-knowledge | covered |
| 147 | The boat sails away, like a bird on the wing. | `zonavar thugem vonavalum hewem blebezel gwuzewobol.` | `z-←boat \| th-LIVE \| v-boat-recede \| [h-like \| [bl-bird \| g-episode-agent-wing]]` | covered |
| 148 | They looked cautiously about, but saw nothing. | `zeyelx thevum huyulom vezebem el bual. xugohum zeyerx dal vayebel.` | z-person-x \| th-MEMORY \| h-caution \| v-look \| [at \| b-everything] . x-but \| z-←person-x-x \| d-none \| v-see | covered |
| 149 | The little house had three rooms, a sitting room, a bedroom, and a tiny kitchen. | `zovahehal zoyahehal zuguyohal welazem gamezem zal gobom blohehar gamezem thevum.` | [z-living-room \| z-bedroom \| [z-kitchen \| [w-very \| g-small]] \| z-and \| [g-part-of \| [bl-←house \| g-small]]] \| th-MEMORY | covered |
| 150 | We visited my uncle's village, the largest village in the world. | `zuwenx thevum dahaham om beyel gemugel growamol bleyel growubal bluwen vowurolol. zahahar zol gelazem al bogugal.` | `z-speaker-x \| th-MEMORY \| [d-locality \| [used-by \| [b-person \| g-male \| [g-#-e0 \| [bl-person \| [g-#-e-1 \| bl-speaker]]]]]] \| v-attend . [z-←locality \| z-rank/more \| g-big] \| [in \| b-globe]` | covered |
| 151 | We learn something new each day. | `zuwenx veluyol dar gunonam hrabal hrubal blazurom.` | z-speaker-x \| v-learn \| [d-something \| g-news] \| h-one \| [h-divided-by-one \| b-day] | covered |
| 152 | The market begins five minutes earlier this week. | `zudaham thubom zuel bral bumurom g+5 vebugol herom blagoror om buwen.` | [z-market \| th-PATTERN \| z-rank/less \| b-later] \| [b-minute \| g-five.short] \| v-begin \| [h-while \| [b-←calendar \| [near \| b-speaker]]] | covered |
| 153 | Did you find the distance too great? | `yel ? zuravam thudatham blawan zol gelazem thevum.` | `y-question \| [? \| z-length \| [th-sake-met-any-term \| bl-listener] \| z-rank/more \| g-big] \| th-MEMORY` | covered |
| 154 | Hurry, children. | `yohoyolx. yel vadurom.` | y-child-x . y-command \| v-haste | covered |
| 155 | Madam, I will obey your command. | `yawan. zuwen thagom vuhozam dawan.` | y-listener . z-speaker \| th-plan-itinerary \| v-conformity \| d-listener | covered |
| 156 | Here under this tree they gave their guests a splendid feast. | `zeyelx thevum om buwen hoduhol bledalor vewal beyelx gabodum bleyerx denodal gemem.` | z-person-x \| th-MEMORY \| [near \| b-speaker] \| [h-down \| b-←tree] \| v-present \| [b-person-x \| [g-hospitality \| b-←person-x-x]] \| [d-bento \| g-amazement] | covered |
| 157 | In winter I get up at night, and dress by yellow candlelight. | `zuwen huam herom blugebam vabuhol herom blanurul xal zuwen vedobal aol bagewol guyulol.` | `[z-speaker \| h-always.open \| [h-while \| bl-winter] \| v-up \| [h-while \| bl-night] \| x-and \| z-speaker \| v-dress \| [using \| [b-candle \| g-yellow]]]` | covered |
| 158 | Tell the last part of that story again. | `yol herugom duvahum gobom blonom vezuyol.` | `y-command \| h-again \| [d-terminus \| [g-part-of \| bl-tale]] \| v-tell` | covered |
| 159 | Be quick or you will be too late. | `yol gadurom xel zawan thudatham zol bral vevorol.` | y-command \| [g-haste \| x-or-exactly-one \| [z-listener \| th-sake-met-any-term \| z-rank/more \| b-later] \| v-arrival] | covered |
| 160 | Will you go with us or wait here? | `yel ? zawan thagom han bluwenx vavobol xel zawan thagom vabahom om buwen.` | `y-question \| [? \| z-listener \| th-plan-itinerary \| [h-including \| bl-speaker-x] \| v-go \| x-or-exactly-one \| z-listener \| th-plan-itinerary \| v-wait \| [near \| b-speaker]]` | covered |
| 161 | She was always, shabby, often ragged, and on cold days very uncomfortable. | `zalazun thevum hual gelahum. zalazun thubom zol hral welazem gelahum thevum. zalazun thevum welazem gahuyam gul herom blazuromx gogomul.` | `z-Alazun \| th-MEMORY \| h-always-except \| g-breakdown . [z-Alazun \| th-PATTERN \| z-rank/more \| h-how-often] \| [w-very \| g-breakdown] \| th-MEMORY . z-Alazun \| th-MEMORY \| [[w-very \| g-comfort] \| g-not] \| [h-while \| [bl-day-x \| g-cold]]` | covered |
| 162 | Think first and then act. | `yol vevemel xan vuzubam.` | y-command \| [v-think \| x-and-then \| v-effort] | covered |
| 163 | I stood, a little mite of a girl, upon a chair by the window, and watched the falling snowflakes. | `zuwen th(zuwer goyoyol gamezem) thevum vuzuvel ael behohel em buwohel xal zuwen thevum vezebem dozelulx gwuzoduhol.` | `[z-speaker \| th-ASIDE[z-←speaker \| g-girl \| g-small] \| th-MEMORY \| v-stand \| [on \| [b-chair \| [near \| b-window]]] \| x-and \| z-speaker \| th-MEMORY \| v-look \| [d-snowflake-x \| g-episode-agent-down]]` | covered |
| 164 | Show the guests these shells, my son, and tell them their strange history. | `yawan. yol zeyelx gabodum bluwen dehebalx em buwen vayebel thewom blawan. yol beyerx donom gulayem om beyerx vezuyol.` | `y-listener . y-command \| [z-person-x \| [g-hospitality \| bl-speaker]] \| [d-shell-x \| [near \| b-speaker]] \| v-see \| [th-CAUSE \| bl-listener] . y-command \| b-←person-x-x \| [d-tale \| g-strangeness \| [used-by \| b-←person-x-x]] \| v-tell` | covered |
| 165 | Be satisfied with nothing but your best. | `yol guremem el buzubam om bawan bal.` | y-command \| g-calm \| [at \| [[b-effort \| [used-by \| b-listener]] \| b-and]] | covered |
| 166 | We consider them our faithful friends. | `zuwenx vevemel darl zeyerx godozem gamayam bluwenx.` | z-speaker-x \| v-think \| d-that-clause \| [z-←person-x \| g-loyalty \| [g-companionship \| b-speaker-x]] | covered |
| 167 | We will make this place our home. | `zuwenx thagom dahaham em buwen vomuyal ol boheham om buwenx.` | `z-speaker-x \| th-plan-itinerary \| [d-locality \| [near \| b-speaker]] \| v-manufacture \| [for \| [b-home \| [used-by \| b-speaker-x]]]` | covered |
| 168 | The squirrels make their nests warm and snug with soft moss and leaves. | `zezezalx huam dunolalx wadowem gohamul gahuyam om bezezar aol bebelal bolelel bal vomuyal.` | `z-squirrel-x \| h-always.open \| [d-nest-x \| [w-quite \| g-hot] \| g-comfort \| [used-by \| b-←squirrel-x] \| [using \| [b-herb \| b-leaf \| b-and]]] \| v-manufacture` | covered |
| 169 | The little girl made the doll's dress herself. | `zoyoyol gamezem zal thevum dedobal om beneval vomuyal.` | `[[z-girl \| g-small] \| z-and] \| th-MEMORY \| [d-dress \| [used-by \| b-nesting-doll]] \| v-manufacture` | covered |
| 170 | I hurt myself. | `zuwen duwer venemum.` | z-speaker \| d-←speaker \| v-harm | covered |
| 171 | She was talking to herself. | `zalazun thevum blalazur vezuyol.` | z-Alazun \| [th-MEMORY \| b-←Alazun] \| v-tell | covered |
| 172 | He proved himself trustworthy. | `zazozon thevum dazozor gegowom verenom.` | z-Azozon \| th-MEMORY \| [d-←Azozon \| g-trust] \| v-proof | covered |
| 173 | We could see ourselves in the water. | `zuwenx thevum duwerx vayebel al bowulal.` | z-speaker-x \| th-MEMORY \| d-←speaker-x-x \| v-see \| [in \| b-drinking-water] | covered |
| 174 | Do it yourself. | `yol zawan zal vuzubam.` | y-command \| [z-listener \| z-and] \| v-effort | covered |
| 175 | I feel ashamed of myself. | `zuwen thawethumem bluwer.` | `z-speaker \| [th-relatedness-unmet-modifiable-AIMED-FLOWING \| bl-←speaker]` | covered |
| 176 | Sit here by yourself. | `yol zawan zal vehohel om buwen.` | y-command \| [z-listener \| z-and] \| v-sit \| [near \| b-speaker] | covered |
| 177 | The dress of the little princess was embroidered with roses, the national flower of the Country. | `dedobal om boyoyol gamezem gegobom venewul aol barelalx. zarelarx gevelal gobom blahal.` | `[d-dress \| [used-by \| [b-girl \| g-small \| g-leadership]]] \| v-needle \| [using \| b-rose-x] . [z-←rose-x-x \| g-flower \| [g-part-of \| bl-country]]` | covered |
| 178 | They wore red caps, the symbol of liberty. | `zeyelx thevum danobalx gerulol vedobal. zanobarx gezugal gehugom blezahem.` | z-person-x \| th-MEMORY \| [d-hat-x \| g-red] \| v-dress . [z-←hat-x-x \| g-symbols \| [g-topic \| b-liberty]] | covered |
| 179 | With him as our protector, we fear no danger. | `han blazozon gagayul om buwenx zuwenx dugobum dul vevemul.` | `[h-including \| [bl-Azozon \| g-guard \| [used-by \| b-speaker-x]]] \| z-speaker-x \| [d-danger \| d-not] \| v-fear` | covered |
| 180 | All her finery, lace, ribbons, and feathers, was packed away in a trunk. | `dual gerebom om balazun velobal al belobal.` | `[d-everything \| g-embellishment \| [used-by \| b-Alazun]] \| v-carry \| [in \| b-luggage]` | covered |
| 181 | Light he thought her, like a feather. | `zazozon vevemel darl zalazun thudatham zuol garolem hewem bluvebol.` | `z-Azozon \| v-think \| d-that-clause \| [z-Alazun \| th-sake-met-any-term \| z-rank/less \| g-heavy] \| [h-like \| bl-feather]` | covered |
| 182 | Every spring and fall our cousins pay us a long visit. | `zeyelx growabal bleyel growamol bleyel growubal bluwenx huam herom blual gahelom xal herom blual gavelum hodurom duwenx vowurolol.` | [[z-person-x \| [g-#-e1 \| [bl-person \| [g-#-e0 \| [bl-person \| [g-#-e-1 \| bl-speaker-x]]]]]] \| h-always.open \| [h-while \| [bl-everything \| g-spring]] \| x-and \| [h-while \| [bl-everything \| g-autumn]] \| h-duration \| d-speaker-x \| v-attend] | covered |
| 183 | In our climate the grass remains green all winter. | `zual gegudal golol hawum herom blugebam am bogulum om buwenx.` | `[z-everything \| g-greens] \| g-green \| h-still \| [h-while \| [bl-winter \| [amid \| b-weather] \| [used-by \| b-speaker-x]]]` | covered |
| 184 | The boy who brought the book has gone. | `zoboyol thevum danal velobal. zoboyor haram vavobolum.` | z-boy \| th-MEMORY \| d-book \| v-carry . z-←boy \| h-RESIDUE \| v-go-recede | covered |
| 185 | These are the flowers that you ordered. | `zawan thevum develalx vogowam. zevelarx em buwen thugem.` | `z-listener \| th-MEMORY \| d-flower-x \| v-consumption . [z-←flower-x-x \| [near \| b-speaker]] \| th-LIVE` | covered |
| 186 | I have lost the book that you gave me. | `zawan thevum danal buwen vewal. zuwen haram danar valurum.` | z-listener \| th-MEMORY \| d-book \| b-speaker \| v-present . z-speaker \| h-RESIDUE \| d-←book \| v-loss | covered |
| 187 | The fisherman who owned the boat now demanded payment. | `zwuzevezal thevum donaval vegunum. zwuzegunur thugem vern dorl daral vewal.` | `z-episode-agent-fish \| th-MEMORY \| d-boat \| v-ownership . z-←episode-agent-ownership \| th-LIVE \| v-question \| d-to-clause \| d-money \| v-present` | covered |
| 188 | Come when you are called. | `yol vavobol oel buwen herom blarl dawan voborom.` | `y-command \| v-go \| [toward \| b-speaker] \| [h-while \| bl-that-clause] \| d-listener \| v-summons` | covered |
| 189 | I shall stay at home if it rains. | `zuwen thagom voheham thohem blarl verulal.` | z-speaker \| th-plan-itinerary \| v-home \| [th-if \| b-that-clause] \| v-rain | covered |
| 190 | When he saw me, he stopped. | `zazozon thevum vezohul herom blarl zazozon thevum duwen vayebel.` | z-Azozon \| th-MEMORY \| v-stop \| [h-while \| b-that-clause] \| z-Azozon \| th-MEMORY \| d-speaker \| v-see | covered |
| 191 | Do not laugh at me because I seem so absent minded. | `yul valamal el buwen thahum blarl zuwen theyomawan gezebem gul.` | `y-prohibition \| v-laugh \| [at \| b-speaker] \| [th-because \| bl-that-clause] \| z-speaker \| th-CLUES-listener \| [g-attention \| g-not]` | covered |
| 192 | I shall lend you the books that you need. | `zawan thugem danalx vebem. zuwen thagom danarx dawan vogeral.` | z-listener \| th-LIVE \| d-book-x \| v-necessity . z-speaker \| th-plan-itinerary \| d-←book-x \| d-listener \| v-lend | covered |
| 193 | Come early next Monday if you can. | `yol zawan thubom zuol bral vavobol oel buwen herom blolerom grobal thohem blarl zawan vavoboxal.` | `y-command \| [z-listener \| th-PATTERN \| z-rank/less \| b-later] \| v-go \| [toward \| b-speaker] \| [h-while \| [bl-weekday \| g-1st]] \| [th-if \| bl-that-clause] \| z-listener \| v-go-able` | covered |
| 194 | If you come early, wait in the hall. | `yol vabahom al begayahal thohem blarl zawan thubom zuol bral vavobol.` | `y-command \| v-wait \| [in \| b-hall] \| [th-if \| bl-that-clause] \| [z-listener \| th-PATTERN \| z-rank/less \| b-later] \| v-go` | covered |
| 195 | I had a younger brother whose name was Antonio. | `zahelan thevum glemugel growamol bluwen. zahelan zuwen zuel guburom.` | z-Ahelan \| th-MEMORY \| gl-male \| [g-#-e0 \| b-speaker] . [z-Ahelan \| z-speaker \| z-rank/less \| g-age] | covered |
| 196 | Gnomes are little men who live under the ground. | `glemugel zeyelx gamezem huam voheham hoduhol blagulal.` | [gl-male \| z-person-x \| g-small] \| h-always.open \| v-home \| [h-down \| b-ground] | covered |
| 197 | He is loved by everybody, because he has a gentle disposition. | `zual geyel dazozon volamal thahum blarl zazozon gegemam.` | [z-everything \| g-person] \| d-Azozon \| v-love \| [th-because \| b-that-clause] \| [z-Azozon \| g-kindness] | covered |
| 198 | Hold the horse while I run and get my cap. | `yol dohazol vovebel. herom blarl zuwen veruvol danobal om buwen velobal val.` | `y-command \| d-horse \| v-fist . [h-while \| bl-that-clause] \| z-speaker \| [v-run \| [[d-hat \| [used-by \| b-speaker]] \| v-carry] \| v-and]` | covered |
| 199 | I have found the ring I lost. | `zuwen thevum dorebel valurum. zuwen haram doreber vumewel.` | z-speaker \| th-MEMORY \| d-ring \| v-loss . z-speaker \| h-RESIDUE \| d-←ring \| v-find | covered |
| 200 | Play and I will sing. | `yol veboham. xan zuwen thagom vozuyel.` | y-command \| v-play . x-and-then \| z-speaker \| th-plan-itinerary \| v-sing | covered |
| 201 | That is the funniest story I ever heard. | `zuwen havem thevum donomx vebam. zonor zol galamam.` | `z-speaker \| h-already \| th-MEMORY \| d-tale-x \| v-hearsay . [z-←tale-x \| z-rank/more \| g-amusement]` | covered |
| 202 | She is taller than her brother. | `zalazun glemugel zeyel growamol blalazun zol gadahom.` | `[z-Alazun \| [gl-male \| z-person \| [g-#-e0 \| bl-Alazun]] \| z-rank/more \| g-height]` | covered |
| 203 | They are no wiser than we. | `zazozonx zuwenx zuol gelayom.` | [z-Azozon-x \| z-speaker-x \| z-rank/less \| g-wisdom] | covered |
| 204 | Light travels faster than sound. | `zubalel zugowum zol hadurom vavobol.` | [z-bright \| z-volume \| z-rank/more \| h-haste] \| v-go | covered |
| 205 | We have more time than they. | `zuwenx zazozonx zol gral dodurol vegunum.` | [z-speaker-x \| z-Azozon-x \| z-rank/more \| g-amount] \| d-time \| v-ownership | covered |
| 206 | She has more friends than enemies. | `zahuyayelx om balazun zeyelx guvuvum om balazun zol gral.` | `[z-friend-x \| [used-by \| b-Alazun]] \| [[z-person-x \| g-struggle \| [used-by \| b-Alazun]] \| z-rank/more \| g-amount]` | covered |
| 207 | He was very poor, and with his wife and five children lived in a little low cabin of logs and stones. | `zazozon thubom zuol wohalal gral thevum daral vegunum. zazozon thevum voheham han bleyel guvugel gohuyam blazozon han blohoyolx g+5 al bahahal gamezem hulom blulol blarolel bal.` | `[z-Azozon \| th-PATTERN \| z-rank/less \| [w-ocean \| g-amount]] \| th-MEMORY \| d-money \| v-ownership . z-Azozon \| th-MEMORY \| v-home \| [h-including \| [bl-person \| g-female \| [g-partnership \| bl-Azozon]]] \| [h-including \| [bl-child-x \| g-five.short]] \| [in \| [b-hut \| g-small]] \| [h-material \| [bl-wood \| bl-rock \| b-and]]` | covered |
| 208 | When the wind blew, the traveler wrapped his mantle more closely around him. | `zwuzowurol thubom zol hahuyam thevum dogobal om bwuzowuror vubedum hevam blwuzowuror. herom blarl zawulol thevum vawulol.` | `[z-episode-agent-walk \| th-PATTERN \| z-rank/more \| h-comfort] \| th-MEMORY \| [d-coat \| [used-by \| b-←episode-agent-walk]] \| v-encapsulation \| [h-around \| bl-←episode-agent-walk] . [h-while \| bl-that-clause] \| z-wind \| th-MEMORY \| v-wind` | covered |
| 209 | I am sure that we can go. | `zuwenx theyol vavoboxal.` | z-speaker-x \| th-CLUES.strong \| v-go-able | covered |
| 210 | We went back to the place where we saw the roses. | `zuwenx thevum darelalx vayebel el bahaham. zuwenx thevum vavobol heyuhol oel bahahar.` | `z-speaker-x \| th-MEMORY \| d-rose-x \| v-see \| [at \| b-locality] . z-speaker-x \| th-MEMORY \| v-go \| h-back \| [toward \| b-←locality]` | covered |
| 211 | "This tree is fifty feet high," said the gardener. | `zwozabolel thevum d[zedalol gadahom bezerom g+15 om buwen] vezuyol.` | `z-role-agent-plant \| th-MEMORY \| d-CITE[z-tree \| g-height \| b-meter \| g-15 \| rather.open \| b-speaker] \| v-tell` | covered |
| 212 | I think that this train leaves five minutes earlier today. | `zuwen vevemel darl zedavol om buwen thubom zuel bral bumurom g+5 herom blazurom om buwen vavobolum.` | z-speaker \| v-think \| d-that-clause \| [[z-train \| [near \| b-speaker]] \| th-PATTERN \| z-rank/less \| b-later] \| [b-minute \| g-five.short] \| [h-while \| [b-day \| [near \| b-speaker]]] \| v-go-recede | covered |
| 213 | My opinion is that the governor will grant him a pardon. | `zuwen vevemel darl zwozegobol theyom blral dazozon vabugem.` | `z-speaker \| v-think \| d-that-clause \| z-role-agent-crown \| [th-CLUES \| bl-later] \| d-Azozon \| v-forgiveness` | covered |
| 214 | Why he has left the city is a mystery. | `vemayem derl zazozon haram vavobolum ul bazahol thahum blar.` | v-mystery \| d-whether-clause \| z-Azozon \| h-RESIDUE \| v-go-recede \| [from \| b-skyline] \| [th-because \| bl-something] | covered |
| 215 | The house stands where three roads meet. | `zoraholx g+3 vawahom. zohehal thugem vuzuvel al bawahor.` | [z-road-x \| g-three.short] \| v-hub . z-house \| th-LIVE \| v-stand \| [in \| b-←station] | covered |
| 216 | He has far more money than brains. | `zaral om bazozon zebobem om bazozon zol wohalal gral.` | `[z-money \| [used-by \| b-Azozon]] \| [[z-intellect \| [used-by \| b-Azozon]] \| z-rank/more \| [w-ocean \| g-amount]]` | covered |
| 217 | Evidently that gate is never opened, for the long grass and the great hemlocks grow close against it. | `zohel theyol vohel hal thahum blarl zegudal guravam zedalolx gelazem zal velom om boher.` | z-door \| th-CLUES.strong \| v-open \| h-never \| [th-because \| b-that-clause] \| [[z-greens \| g-length] \| [z-tree-x \| g-big] \| z-and] \| v-growth \| [near \| b-←open] | covered |
| 218 | I met a little cottage girl; she was eight years old, she said. | `zuwen thevum doyoyol gamezem gegaham vawahom. zoyoyor thevum d~[zoyoyor bovuvam g+8 guburom] vezuyol.` | z-speaker \| th-MEMORY \| [d-girl \| g-small \| g-rural] \| v-hub . z-←girl \| th-MEMORY \| d-CITE.about[z-←girl \| [b-year \| g-eight.short \| g-age]] \| v-tell | covered |

### Notes

- **STC-1–10, *the sun*:** a full-root resume `zezalor` with no antecedent is *the one we both know*, which fits a unique referent. No article gap.
- **STC-1:** read as a plain report. A general truth (*the sun shines, as a rule*) would add *always* `hual`.
- **STC-2–7, tense:** by design (no tense letter). The progressive is LIVE, the past is MEMORY, and the future is a channel + `blral`. *Tomorrow* is the day offset +1 on that channel. Each forecast has to choose a warrant; PATTERN is the honest one for sunrise.
- **STC-5, *has been shining*:** *still* `hawum` carries "began earlier, goes on now". The English duration-up-to-now is only implied; a measured duration would need a measure phrase.
- **STC-10, *now*:** LIVE already means "in view now" and takes no zero offset, so there is no separate *now* word.
- **STC-8:** with `v:shine` on *bright*, `hubalel vubalel` reads *shines brightly*, like the English.
- **STC-11–13, *the people*:** `zual geyel` with no place hook is every person the situation is about. *Some of* / *many of* resume the known group (`zeyerx`) and give the amount, per the denominator recipe; *many* names the Typical bar.
- **STC-15–20, *kitten*:** a live compound, *baby* `x` *cat* (`ebebexagada`); later mentions resume it in full.
- **STC-17, 26, 31, 33, *away*:** hook compound with `um` (*recede*) on the motion verb: `vowurolum`, `vavobolum`, `vuwovolum`, `vememulum`.
- **STC-19, 21:** *came down* is *fall*; *has stopped* is *no longer* `huvum` (the rain no longer falls), so no *stop* verb is needed.
- **STC-24, *once*:** FORMER `helam` (a past climate, not today's). *Here* is `em buwen`.
- **STC-28, *should*:** prescription with the unnamed sake, `thudathem`. **STC-37, *must*:** `hwuvom`.
- **STC-29, *happy to*:** emotion compose on `/th/`: pleasure met, INTERNAL, FLOWING (`thodethamam`) — the speaker's own feeling, so no holder is needed.
- **STC-33, *probably*:** stance number `thral` (*likely*, no figure).
- **STC-38, *opposite*:** `honuhothayan` — in front, as the two of us face. *Directly* is dropped.
- **STC-45, *village*:** *hut* in its abstract sense, `bahaham` (*locality*). *For a visit* is `hovam` + the *attend* compound as a noun.
- **STC-47, *wait for you*:** the awaited person is the object.
- **STC-50, *her father*:** kin number `growubal` (the layer above) + `/b/` the child, with *male* before it. Long, but every piece is taught.
- **STC-51, *oldest girl in the village*:** superlative `zoyoyol zol guburom`; the group in play is set by the clause-level *in the village* hook. *Yesterday* is the day offset −1 on MEMORY.
- **STC-52–56, 59, 73, 97, 99, questions:** no channel under `yel` where *did* / *are … coming* read from the bare verb. A question about intent takes PLAN (STC-56 *can you come tomorrow*). A forecast in a question puts a channel under `yel`, which asks for the listener's warrant (STC-73, 97: CLUES + `blral`). *Ready* in STC-97 is the verb *prepare* (`vabam`), since `gabam` is *before*.
- **STC-52, *this village*:** `al bahaham em buwen`: a hook + `/b/` right after a landmark describes it (*the village near me*).
- **STC-53, 55, *your brother / sister*:** sibling kin `growamol` + `/b/` listener, with *male* / *female* before. **STC-89, 93, *father*, *his boy*:** `growubal` / `growabal` on the kin anchor.
- **STC-57, *neighbors*:** agent compound on *home* (`zwuzohehamx`) + *near us*. *Gone away* keeps RESIDUE (they are still away). *Winter* is the *gloves* abstract (`bugebam`).
- **STC-58, 91, *robin*:** compound *red* `x` *bird* (`eredaxebedu`); the habit question is an open universal `zuam`.
- **STC-59, *concert*:** the event noun of *sing* (`bozuyel`, a singing). *With us* (not the listener) is `han bluwenx`. **STC-63, 72, 92:** narrative *we* that leaves the listener out is `zuwenx`, not `zayan`.
- **STC-60, *ever*:** `havem … har`. *Travel* is `vahavam` (*voyage*). *Jungle* is the compound *palm* `x` *tree* (`boyaloxedalolx`).
- **STC-61, *several miles*:** metric, not miles: `bezerom grawagem` (*thousands of meters*, about). *Down* the river is dropped.
- **STC-62, *knows*:** the *book* abstract as a verb (`vanam`); *about* is `hehugom`. *Everybody* is open `zuam` (as far as I know). *Hunting* stays *predation* (`buwozum`); the verb *hunt* is `varunol`, role English on *archery*.
- **STC-63, *solstice*:** compound *sun* `x` *stop* (`bezaloxezohul`). *Started for* is the hook compound *go* + *toward* (`vavoboloel`).
- **STC-63, 71, 74, 76:** fronted place phrases (`ael bamahul …`, `am bogelal …`) now parse as extra-noun hooks (parser fix; see results).
- **STC-64, *the monkey's tricks*:** two sentences, then an event resume (`badayur`), the recipe for an act as someone's (say-people-places.md § someone's act).
- **STC-66, *was hidden by*:** object first, then the hider as subject. *Boughs* is *tree* `x` *bone* (`zedaloxobolx`).
- **STC-67, *spring sun*:** the time pole on the noun, `gerom blahelom` (*during spring*).
- **STC-68, *wreaths … on their heads*:** *wreath* is the compound `bevelalegobolx`. *On their heads* is dropped: a hook + `/b/` after the wreath (`ael behobelx`) would split the *many* rank from its noun. *Head* is `behobel`.
- **STC-70, *in the line*:** dropped; the ordinal already says the order.
- **STC-71, *lived*:** NOTIONAL `theyum`, since this is story narration; later sentences of the tale carry it forward.
- **STC-73, *your guests*:** people cannot take `om`, so *guests* is the *hospitality* tie (`gabodum blawan`); *from the city* goes before the noun with `gl-`, since two relation adjectives cannot follow one noun.
- **STC-74, *sharply*:** `hanewum` (*severity*, the knife abstract). *Course turns* is `varugom` (*turn*, the abstract on *refresh*).
- **STC-75, 76, 78, 79:** an `/h/`-hosted `/b/` now keeps its adjectives (`hedam blamahulx gradol gadahom`, `hewem blemuyal gazamam`; parser fix).
- **STC-82, 94, *happy*:** emotion compose, pleasure met, INTERNAL, FLOWING (`thodethamam`). Someone else's feeling takes a holder (STC-88 `theyomoyoyor`, STC-94 `thugemeyerx`); a holder can be a full-root resume, and a group takes **-x** (*those people*).
- **STC-83, *these oranges*:** full-root resume (the ones we both see) plus *near me*; a new noun would read as *there are juicy oranges here*.
- **STC-84, *sea water is salty*:** `zuam` + kind + `/ɡ/` is a property of every member, as a rule (exceptions not listed).
- **STC-85, *full of people*:** approximated as *many people in the streets* (Typical bar). *Streets* is *road* (`boraholx`).
- **STC-86, 87, *tastes / feels*:** the sense is the channel: LIVE for a present touch, PATTERN for a general taste. *Sugar* is the *candy* abstract (`gunedam`).
- **STC-89, *had once been*:** FORMER `helam`. The predicate *sailor* sits between the noun and the kin relation, so it describes the father, not the boy.
- **STC-95, *Monday*:** *first weekday* (`zolerom grobal`, counting from Monday) under LIVE for *today*.
- **STC-65, 69, 72, 76, 77, 79, 80, 144, new words:** *fence* `bulolugohul`, *floor* `bohehalagulal`, *field* `bevahalx`, *wheat* `bogelal` (*grain*), *oak* `buneduledalolx`, *ground* `bagulal`, *face* `bovemel`, *summer* `bazedam`.
- **STC-72, 79, 96, new rows:** *country* is `begaham` (*rural*), *caress* is *hug* (`bahuyal`), *leaves* is `golelel`.
- **STC-98, a polite request:** English *Will you … for me?* is a request, so it takes soft request `yom`; *for me* is proxy `hanem`.
- **STC-100, *first of the litter*:** eldest sibling `g#1e0`.
- **STC-101, 115, *these shoes* / *this tree*:** full-root resume only. `em buwen` before a rank join or a fill-ask list would make the next `/ɡ/` words describe the speaker (the landmark). *Too big for you* is the unspecified sake bar with the listener in its `/b/` as whose stake (`thudatham blawan`).
- **STC-102, *how wide*:** `wrar` on *width* (`gagoram`, the *accordion* abstract).
- **STC-103–108, commands:** *listen* is the *ear* abstract as a verb (`vebam`), not *hear* (`vebal`). *Keep this secret* is *keep confidential* (`vuhamum`, the *hush* abstract) with `darth` for *this*; *until tomorrow* is a signed day count in the pole's `/b/` (`harum blazurom grabal`), counted from now. *Be careful* is `yol guyulom`, a command with only a `/ɡ/` body. *Come* / *bring … with you* is `vavobol` + `han` (company); with a place, `oel buwen`.
- **STC-90, *blanket*:** the *yarn* abstract (`dayulam`). **STC-134, *too short*:** less *length* (`guravam`, the *railcar* abstract). **STC-142, *threw … lake*:** `vobovol` (role English on *boomerang*) and `begavom` (the *canoe* abstract).
- **STC-109, *have some tea*:** an offer, so soft request `yom`; `gral` on a mass noun is *some*. The verb is `vuwudal` (*drink*).
- **STC-110, 111, *friends* / *brother and sister*:** the tie or kin word is SHARED after the join with no `/b/`, so *of each other* is only implied (G-17). *His dog* is a hook + `/b/` right before the join word (`zodozel om bazozor zal`, G-18).
- **STC-112, *go together*:** PLAN plus collective **-x** on the verb.
- **STC-113, *all the doors and windows*:** two *every K* clauses, since a kind join after `dual` does not read as one kind. *Open* is `vohel` (role English on *door*).
- **STC-114, 118, 130, 148, *but*:** the linker `xugohum` starts a second sentence. *Small but strong*, *tired but happy*: the first claim sets an expectation the second blocks.
- **STC-116, *the sky … look*:** *sky* (`zugalam`, the *cloud* abstract) and *gray* (`gagulel`); *look* is LIVE, as *feels* was in STC-87. The choice is a fill-ask over the two colors (`?gar`).
- **STC-117, 131, 150, kin:** *father or mother* is the parent layer with no mantissa (`growubal`, one member). *Uncle* is a male sibling of a parent. *Mother* is `guvugel` before the kin number.
- **STC-119, *played a tune on*:** *perform* (`vuwem`) with the flute as a tool (`aol`); `om bazozor` follows the flute's adjective, as in hooks.md § Whose.
- **STC-120, *toward the end of August*:** *near 31 August* (`em b_#31,8`). *The days grow much shorter* is *much less duration than usual* on PATTERN.
- **STC-121, *company of soldiers marched*:** *guards* (💂) walking as one act (`vowurolx`). The fronted *over the hill* keeps the two extras apart.
- **STC-122, *the first part of the story*:** *the beginning* (`zebugor`, a full-root resume), with *interesting* (*curiosity*) before the relation so it describes the beginning, not the story.
- **STC-123, *crow*, *pitcher*, *brim*:** *black* `x` *bird*, *amphora*, *the top part of it*. *Dropped* is *fall* with an object.
- **STC-124, *in glee*:** SHARED `/h/` after a verb join covers both verbs. The manner is observable, so no holder is needed.
- **STC-125, *stop … and be quiet*:** *no longer play* (`huvum veboham`), then *be quiet* as a `/ɡ/`-only command clause (`gozemem`) in a clause join under the same command.
- **STC-126, *louder and louder*:** *rose in volume* (`hugowum vayurol`, the uptrend verb).
- **STC-127, *better*:** `?dor` asks which ranks first. *Summer* is the *ice-cream* abstract (`dazedam`).
- **STC-128, 139:** *will* is CLUES + `blral`; *too late* is a sake bar, `thudatham zol bral`.
- **STC-129, 132, 142:** a string of acts by one subject is `xan` with a resumed subject, since verb-join items cannot carry their own objects (G-19).
- **STC-133–137, interjections:** `/y/` + **-n** on the matching root: *aha* is *insight* (`yalulun`), *oh dear* is *worried* (`yewemun`), *alas* is *cry* (`yagamun`), *whew* is *phew* (`yuvumen`). *Indeed* and the English *!* are the `!` tone mark.
- **STC-136, *that news is sad*:** the speaker's feeling on a noun they do not own, so emotion compose on `/w/` + `goyom`.
- **STC-138, *warm enough now*:** the unspecified sake bar's tie on *hot*, and INTUITION with a zero offset asks what the listener's body says now.
- **STC-140, *a brave people*:** reduced to *we are brave*.
- **STC-143, 144:** story narration, so NOTIONAL. *Outside the door* is *at the door*.
- **STC-145, *our bird's name is Jacko*:** two sentences, since `gorel` after `om buwenx` would describe the speaker group.
- **STC-146, *the way to the sea*:** *road* with *toward the sea*.
- **STC-147, *on the wing*:** *flier* (agent compound on *wing*).
- **STC-149, *rooms*:** the dictionary words *living room*, *bedroom*, and *kitchen*. *Had three rooms* is an existence list SHARED as *part of the little house*; the count is the list.
- **STC-151, 182, *each day* / *every spring and fall*:** a counted unit is a count per unit (`hrabal hrubal blazurom`, once per day); named seasons are a universal kind in the time pole (`herom blual gahelom`). *Something new* is `dar` (an unnamed new thing) plus *news* (`gunonam`).
- **STC-152, *market*, *minutes*, *this week*:** *market* is the new abstract on 🏬 (`zudaham`, L-09). *Minute* is the new stock unit `bumurom` (L-10). *This week* is the full-root resume `bagoror` plus `em buwen`, which describes the week ([hook + `/b/` on a landmark](/hooks)). *Earlier* is the `bral` scale against the *Usual* bar.
- **STC-153, *find … too great*:** *distance* is *length* (`zuravam`). MEMORY under `yel` asks for the listener's own warrant, as in STC-97.
- **STC-154, 155, 164, address:** *children* is a kind vocative with **-x** (`yohoyolx`). *Madam* and *my son* are the listener (`yawan`); the title and the kin word are dropped.
- **STC-155, *obey*:** `vuhozam` (the *conformity* abstract). *Command* is dropped; `vern` states a command as content, but here the act is the obeying.
- **STC-156, *here under this tree*:** `hoduhol` + landmark is *under* (roles.md § gravity). *Feast* is a wonderful *bento* (`denodal gemem`), *gave* is `vewal` (*present*), and *their guests* is the *hospitality* tie with a resume (`beyelx gabodum bleyerx`).
- **STC-157, *in winter … at night*:** two `herom` poles, with COMMON for the routine. *Candlelight* is *using a yellow candle* (`guyulol`); *get up* is `vabuhol` (*up*), *dress* is `vedobal`.
- **STC-158, *last part*:** *the end* (`duvahum`, the *finish-line* abstract) of the tale, as in STC-122.
- **STC-159, 160, *or*:** `xel` between clauses. In 159 the second clause is the rank claim *later than needed* with the verb *arrive*, so the threat is the outcome, not a forecast.
- **STC-161, *shabby*, *ragged*, *uncomfortable*:** three claims. *Shabby* and *ragged* are *breakdown* (`gelahum`, as *broken* in STC-41), with `welazem` on the second; *uncomfortable* is *not comfortable* (`gahuyam gul`) placed before the *cold days* pole so the `/w/` word stays on the adjective.
- **STC-162, *think first and then act*:** verb join `xan` (*and then*). *Act* is *effort* (`vuzubam`).
- **STC-163, *a little mite of a girl*:** an aside with a resume of the speaker (`th(zuwer goyoyol gamezem)`). *Falling* is the agent compound on *down* (`gwuzoduhol`).
- **STC-164, *show … tell*:** *show* is CAUSE with the listener as causer (`thewom blawan`): the guests are the subject of *see*. *History* is *tale*, and *strange* is the *alien* abstract (`gulayem`).
- **STC-165, *nothing but*:** the single-item **-l** join is *just* ([joins](/joins)): `el buzubam om bawan bal` is *at only your effort*. *Best* is *effort*.
- **STC-166, *consider … faithful friends*:** `darl` and a second sentence. *Faithful* is the *loyalty* abstract on *dog* (`godozem`).
- **STC-167, *make this place our home*:** *make* (`vomuyal`) with `ol` (*for*) and *home* (`boheham`, the *house* abstract), owned by us with `om`. *This place* is *locality* plus `em buwen`.
- **STC-168, *warm and snug … soft moss*:** *warm* is *quite hot* (`wadowem gohamul`), *snug* is *comfort*, *moss* is *herb* (`bebelal`); *soft* is dropped. The noun join `bal` closes *herb and leaf*, both under `aol`.
- **STC-169, 174, 176, *-self* as *unaided*:** the single-item **-l** join is *just* ([joins](/joins)): `zoyoyol gamezem zal` is *only the little girl*, so nobody else did it. It also gives *alone* (STC-176).
- **STC-170, 171, 173, 175, reflexives:** a resume in the object or recipient slot points back at the subject ([pronouns](/pronouns#resume-r)). *Ashamed of myself* is unmet relatedness aimed at oneself (`thawethumem bluwer`). **STC-172:** *proved* is the *proof* abstract as a verb (`verenom`).
- **STC-177, *embroidered*, *princess*:** no subject, with *sew* from *needle* (`venewul`). *Princess* is *small girl* with *leadership* (`gegobom`). *National flower of the Country* is a second sentence: `gobom blahal` (*country*, 🗾).
- **STC-178, *symbol of liberty*:** *symbols* (`gezugal`) with *about* (`gehugom`) and the *liberty* abstract on *statue*.
- **STC-179, *with him as our protector*:** `han blazozon gagayul om buwenx` (including Azozon the guard). *No danger* is `dugobum dul`.
- **STC-180, *finery … packed*:** *finery* is *embellishment*; lace, ribbons, and feathers are dropped. *Trunk* is *luggage* (`belobal`), *packed away* is *carry* (`velobal`), and the subject is left out.
- **STC-181, *light … like a feather*:** `darl` and a second sentence. *Light* is *less heavy than the unspecified sake bar* (`thudatham zuol garolem`).
- **STC-182, *cousins*, *long visit*:** cousin is a child of a sibling of a parent: three kin anchors (`growabal bleyel growamol bleyel growubal bluwenx`). *Long* is `hodurom`; *pay a visit* is *attend* with the visited as object.
- **STC-183, *climate*, *remains*:** `zual` + kind + `/ɡ/` is a property of every member (STC-84); *remains* is `hawum`; *climate* is *weather* (`bogulum`).
- **STC-184–187, relative clauses:** two sentences with a resume. *Brought* is *carry*; *ordered* is *consumption* (`vogowam`, from *cart*), so *bought*. **STC-187:** the fisherman's own event comes first (`vegunum`, *own*), then the doer resume `zwuzegunur` ([roles](/roles#this-instance-r)), and *demanded payment* is `vern` with *money given*.
- **STC-188–190:** `herom blarl` is *when*, `thohem blarl` is *if*. *Stop* is `vezohul`; *called* is *summoned* (`voborom`).
- **STC-191, *seem*:** the holder seam names the listener (`theyomawan`, *as you see it*), so the speaker never states the impression as plain fact. *Absent-minded* is *not attentive* (`gezebem gul`).
- **STC-192, *lend*, *need*:** *lend* is role English on *credit-card* (`vogeral`); *need* is the *necessity* abstract as a verb (`vebem`). Two sentences with a book resume.
- **STC-193, 194, *early*, *Monday*:** *early* is the PATTERN bar, `thubom zuol bral` (G-03); the bar needs a ranked item, so the listener is named; *next Monday* is the weekday ordinal under `herom` (G-14). *Hall* is the dictionary word `begayahal`.
- **STC-195, *name was Antonio*:** the name is a house-cast name (`zahelan`), not a foreign payload. *Younger* is the rank on *age*, said as its own sentence.
- **STC-196, *gnomes*:** no gnome root; *little men* under `hoduhol blagulal` (*down* on the ground), with COMMON for the habitual claim. *Under* has no hosted relation of its own.
- **STC-197, *loved by everybody*:** object first, then the lover as subject; *gentle* is *kindness* (`gegemam`) under the because pole.
- **STC-198, 199, *hold*, *find*:** *hold* is *seize* (`vovebel`); *find* is role English on *magnify* (`vumewel`, L-12). *Run and get my cap* is a verb list closed by `val` (G-19).
- **STC-201, *funniest*:** *hear* is the *listening* abstract; *story* is the *tale* abstract, and `zonor` is *that one* with the superlative bar.
- **STC-202, 206, 216, comparatives:** the second name is a full noun phrase (`glemugel zeyel growamol blalazun`). *Enemies* is *people of struggle* (`guvuvum`). *Far more* is `wohalal` on the amount scale, as in comparatives.md.
- **STC-203, *no wiser than*:** the whole comparison denied with a **u** join (`zol gamahum zul`: below or tied), not reverse rank `zuol`, which is *not as … as* (comparatives.md § Intermediate; G-23). The English implication that neither is wise is not said.
- **STC-204, *faster*:** the manner scale, `hadurom` (*haste*). *Light* is `zubalel` (*bright*); *sound* is *volume* (`zugowum`).
- **STC-207, *very poor*:** *far fewer than typical* on the amount of money owned. *Wife* is a female partner tie (`gohuyam`), and the two `han` hooks keep *his wife* and *five children* apart. *Cabin* is *little hut*; *low* is dropped; *of logs and stones* is `hulom` with a join.
- **STC-208, *mantle*, *closely*:** *mantle* is *coat*; *traveler* is the agent compound on *walk*. *More closely* is approximated as *more snugly* (`hahuyam`), as in STC-168.
- **STC-209, *sure*:** a strong CLUES channel (`theyol`), the *-l* ending being solid evidence.
- **STC-210, 215, *the place where*:** name the place, then resume it in the next sentence (dependents.md § which noun). *Meet* is the *hub* abstract as a verb (`vawahom`), and the road event is resumed as `bawahor`.
- **STC-211, *fifty feet*:** metric, `bezerom g+15` after the scale adjective, as in say-amounts.md. *Gardener* is the agent compound on *tending*. The quote is an exact cite.
- **STC-212, 213, *I think*:** `vevemel darl`. *My opinion is that* is said as *I think that*; *governor* is the agent compound on *leadership*, *pardon* is *forgive* (`vabugem`).
- **STC-214, *why he has left*:** a reported *why* is the `thahum blar` blank inside `derl` ([reported questions](../grammar/say-questions.md#reported-questions)); *mystery* is the abstract as a verb (`vemayem`) with that clause as its object, so the English subject clause becomes an object.
- **STC-217, *never*, *evidently*:** `hal` is the *never* restrictor; *evidently* is the strong CLUES channel. *Gate* is *door*, and `boher` binds the door noun, though its nearest same-root word is the verb.
- **STC-218, *cottage girl*:** *little rural girl*; *she said* is a paraphrase cite (`d~[…]`) with the age as a measure on *year* (`bovuvam g+8`).

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
