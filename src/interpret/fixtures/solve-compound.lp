% t:0.0 = k1
% t:0.1 = k2
% t:0.2 = k3

% Generic rules (clingo-solver E1).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).

% t:0.0
on("t:0.0").
holds(isa(azozo,erulolebeze)) :- on("t:0.0").
fired("t:0.0",isa(azozo,erulolebeze)) :- on("t:0.0").
% t:0.1
on("t:0.1").
holds(isa(nm("t:0.1",d),erulolebeze)) :- on("t:0.1").
fired("t:0.1",isa(nm("t:0.1",d),erulolebeze)) :- on("t:0.1").
holds(ayebe(z(ahela),d(nm("t:0.1",d)))) :- on("t:0.1").
fired("t:0.1",ayebe(z(ahela),d(nm("t:0.1",d)))) :- on("t:0.1").
% t:0.2
on("t:0.2").
holds(isa(alazu,ebeze)) :- on("t:0.2").
fired("t:0.2",isa(alazu,ebeze)) :- on("t:0.2").

% Compound heads, from compoundHeads().
head(erulolebeze,ebeze).
