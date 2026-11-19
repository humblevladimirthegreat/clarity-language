% t:0.0 = n1
% t:0.1 = n2
% t:0.2 = n3
% t:0.3 = n4
% t:0.4 = n5
% t:0.5 = n6
% t:0.6 = n7

% Generic rules (clingo-solver E1).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).

% t:0.0
on("t:0.0").
holds(isa(nm("t:0.0",d),odoze)) :- on("t:0.0").
fired("t:0.0",isa(nm("t:0.0",d),odoze)) :- on("t:0.0").
count(nm("t:0.0",d),v(3)) :- on("t:0.0").
fired("t:0.0",count(nm("t:0.0",d),v(3))) :- on("t:0.0").
holds(ayebe(z(azozo),d(nm("t:0.0",d)))) :- on("t:0.0").
fired("t:0.0",ayebe(z(azozo),d(nm("t:0.0",d)))) :- on("t:0.0").
% t:0.1
on("t:0.1").
holds(isa(nm("t:0.1",d),odoze)) :- on("t:0.1").
fired("t:0.1",isa(nm("t:0.1",d),odoze)) :- on("t:0.1").
count(nm("t:0.1",d),v(5)) :- on("t:0.1").
fired("t:0.1",count(nm("t:0.1",d),v(5))) :- on("t:0.1").
holds(ayebe(z(alazu),d(nm("t:0.1",d)))) :- on("t:0.1").
fired("t:0.1",ayebe(z(alazu),d(nm("t:0.1",d)))) :- on("t:0.1").
% t:0.2
on("t:0.2").
holds(isa(nm("t:0.2",d),odoze)) :- on("t:0.2").
fired("t:0.2",isa(nm("t:0.2",d),odoze)) :- on("t:0.2").
count(nm("t:0.2",d),rng(v(3),v(5),oel)) :- on("t:0.2").
fired("t:0.2",count(nm("t:0.2",d),rng(v(3),v(5),oel))) :- on("t:0.2").
holds(ayebe(z(ahela),d(nm("t:0.2",d)))) :- on("t:0.2").
fired("t:0.2",ayebe(z(ahela),d(nm("t:0.2",d)))) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(isa(nm("t:0.3",d),odoze)) :- on("t:0.3").
fired("t:0.3",isa(nm("t:0.3",d),odoze)) :- on("t:0.3").
count(nm("t:0.3",d),rng(inf,v(3),uel)) :- on("t:0.3").
fired("t:0.3",count(nm("t:0.3",d),rng(inf,v(3),uel))) :- on("t:0.3").
holds(ayebe(z(alazu),d(nm("t:0.3",d)))) :- on("t:0.3").
fired("t:0.3",ayebe(z(alazu),d(nm("t:0.3",d)))) :- on("t:0.3").
% t:0.4
on("t:0.4").
holds(isa(nm("t:0.4",d),ogoze)) :- on("t:0.4").
fired("t:0.4",isa(nm("t:0.4",d),ogoze)) :- on("t:0.4").
holds(ayebe(z(alazu),d(nm("t:0.4",d)))) :- on("t:0.4").
fired("t:0.4",ayebe(z(alazu),d(nm("t:0.4",d)))) :- on("t:0.4").
% t:0.5
on("t:0.5").
holds(isa(nm("t:0.5",d),odoze)) :- on("t:0.5").
fired("t:0.5",isa(nm("t:0.5",d),odoze)) :- on("t:0.5").
holds(ayebe(z(ahela),d(nm("t:0.5",d)))) :- on("t:0.5").
fired("t:0.5",ayebe(z(ahela),d(nm("t:0.5",d)))) :- on("t:0.5").
% t:0.6
on("t:0.6").
holds(more(dt("lexReading:number",w("gral")),ogoze,odoze)) :- on("t:0.6").
fired("t:0.6",more(dt("lexReading:number",w("gral")),ogoze,odoze)) :- on("t:0.6").

% Number order, from compareValues().
less(v(3),v(5)).
within(v(3),rng(v(3),v(5),oel)).
within(v(5),rng(v(3),v(5),oel)).
within(v(5),rng(inf,v(3),uel)).
