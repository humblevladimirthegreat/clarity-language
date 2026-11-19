% t:0.0 = d1
% t:0.1 = d2
% t:0.2 = d3
% t:0.3 = d4
% t:0.4 = d5
% t:0.5 = d6

% Generic rules (clingo-solver E1).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).

% t:0.0
on("t:0.0").
holds(owuro(z(azozo))) :- on("t:0.0").
fired("t:0.0",owuro(z(azozo))) :- on("t:0.0").
% t:0.1
on("t:0.1").
holds(neg(owuro(z(azozo)))) :- on("t:0.1").
fired("t:0.1",neg(owuro(z(azozo)))) :- on("t:0.1").
% t:0.2
on("t:0.2").
holds(isa(azozo,odoze)) :- on("t:0.2").
fired("t:0.2",isa(azozo,odoze)) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(neg(isa(azozo,odoze))) :- on("t:0.3").
fired("t:0.3",neg(isa(azozo,odoze))) :- on("t:0.3").
% t:0.4
on("t:0.4").
holds(isa(nm("t:0.4",d),odoze)) :- on("t:0.4").
fired("t:0.4",isa(nm("t:0.4",d),odoze)) :- on("t:0.4").
holds(ayebe(z(azozo),d(nm("t:0.4",d)))) :- on("t:0.4").
fired("t:0.4",ayebe(z(azozo),d(nm("t:0.4",d)))) :- on("t:0.4").
% t:0.5
on("t:0.5").
holds(neg(ayebe(z(azozo),d(odoze)))) :- on("t:0.5").
fired("t:0.5",neg(ayebe(z(azozo),d(odoze)))) :- on("t:0.5").

% Fits, from match().
fits(ayebe(z(azozo),d(odoze)),ayebe(z(azozo),d(nm("t:0.4",d)))).
