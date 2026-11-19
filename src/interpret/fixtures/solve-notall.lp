% t:0.0 = w1
% t:0.1 = w2
% t:0.2 = w3

% Generic rules (clingo-solver E1).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).

% t:0.0
on("t:0.0").
clash(notall("t:0.0")) :- fits(i("t:0.0",1),P1), holds(P1), fits(i("t:0.0",2),P2), holds(P2), on("t:0.0").
fired("t:0.0",notall("t:0.0")) :- fits(i("t:0.0",1),P1), holds(P1), fits(i("t:0.0",2),P2), holds(P2), on("t:0.0").
used("t:0.0",notall("t:0.0"),P1) :- fits(i("t:0.0",1),P1), holds(P1), fits(i("t:0.0",2),P2), holds(P2), on("t:0.0").
used("t:0.0",notall("t:0.0"),P2) :- fits(i("t:0.0",1),P1), holds(P1), fits(i("t:0.0",2),P2), holds(P2), on("t:0.0").
% t:0.1
on("t:0.1").
holds(owuro(z(azozo))) :- on("t:0.1").
fired("t:0.1",owuro(z(azozo))) :- on("t:0.1").
% t:0.2
on("t:0.2").
holds(eruvo(z(azozo))) :- on("t:0.2").
fired("t:0.2",eruvo(z(azozo))) :- on("t:0.2").

% Fits, from match().
fits(i("t:0.0",1),owuro(z(azozo))).
fits(owuro(z(azozo)),i("t:0.0",1)).
fits(i("t:0.0",2),eruvo(z(azozo))).
fits(eruvo(z(azozo)),i("t:0.0",2)).
