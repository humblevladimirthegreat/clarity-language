% t:0.0 = a1
% t:0.1 = a2
% t:0.2 = a3
% t:0.3 = a4
% t:0.4 = a5
% t:0.5 = a6
% t:0.6 = a7

% Generic rules (clingo-solver E1).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).

% t:0.0
on("t:0.0").
holds(ozuye(z(ahela))) :- on("t:0.0").
fired("t:0.0",ozuye(z(ahela))) :- on("t:0.0").
always(ozuye(z(ahela))) :- on("t:0.0").
fired("t:0.0",always(ozuye(z(ahela)))) :- on("t:0.0").
% t:0.1
on("t:0.1").
holds(neg(ozuye(z(ahela)))) :- on("t:0.1").
fired("t:0.1",neg(ozuye(z(ahela)))) :- on("t:0.1").
% t:0.2
on("t:0.2").
holds(neg(eruvo(z(alazu)))) :- on("t:0.2").
fired("t:0.2",neg(eruvo(z(alazu)))) :- on("t:0.2").
never(eruvo(z(alazu))) :- on("t:0.2").
fired("t:0.2",never(eruvo(z(alazu)))) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(eruvo(z(alazu))) :- on("t:0.3").
fired("t:0.3",eruvo(z(alazu))) :- on("t:0.3").
% t:0.4
on("t:0.4").
{ holds(ehohe(z(azozo))) } :- not holds(neg(ehohe(z(azozo)))), on("t:0.4").
fired("t:0.4",ehohe(z(azozo))) :- holds(ehohe(z(azozo))), not holds(neg(ehohe(z(azozo)))), on("t:0.4").
holds(ehohe(z(azozo))) :- not holds(neg(ehohe(z(azozo)))), switch(defaults), on("t:0.4").
fired("t:0.4",ehohe(z(azozo))) :- not holds(neg(ehohe(z(azozo)))), switch(defaults), on("t:0.4").
% t:0.5
on("t:0.5").
always(owuro(z(azozo),w(dt("unit:h","herulal")))) :- on("t:0.5").
fired("t:0.5",always(owuro(z(azozo),w(dt("unit:h","herulal"))))) :- on("t:0.5").
% t:0.6
on("t:0.6").
holds(neg(owuro(z(azozo)))) :- on("t:0.6").
fired("t:0.6",neg(owuro(z(azozo)))) :- on("t:0.6").
holds(neg(ehohe(z(azozo)))) :- on("t:0.6").
fired("t:0.6",neg(ehohe(z(azozo)))) :- on("t:0.6").

% Fits, from match().
fits(owuro(z(azozo)),owuro(z(azozo),w(dt("unit:h","herulal")))).
