% t:0.0 = h1
% t:0.1 = h2
% t:0.2 = h3
% t:0.3 = h1o
% t:0.4 = h1i
% t:0.5 = h4

% Generic rules (clingo-solver E1).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).

% t:0.0
on("t:0.0").
holds(ehohe(z(alazu))) :- fits(c("t:0.0"),P), holds(P), on("t:0.0").
fired("t:0.0",ehohe(z(alazu))) :- fits(c("t:0.0"),P), holds(P), on("t:0.0").
used("t:0.0",ehohe(z(alazu)),P) :- fits(c("t:0.0"),P), holds(P), on("t:0.0").
holds(neg(owuro(z(azozo)))) :- fits(P,o("t:0.0")), holds(neg(P)), on("t:0.0").
fired("t:0.0",neg(owuro(z(azozo)))) :- fits(P,o("t:0.0")), holds(neg(P)), on("t:0.0").
used("t:0.0",neg(owuro(z(azozo))),neg(P)) :- fits(P,o("t:0.0")), holds(neg(P)), on("t:0.0").
% t:0.1
on("t:0.1").
holds(ezuve(z(ahela))) :- fits(c("t:0.1"),P), holds(P), on("t:0.1").
fired("t:0.1",ezuve(z(ahela))) :- fits(c("t:0.1"),P), holds(P), on("t:0.1").
used("t:0.1",ezuve(z(ahela)),P) :- fits(c("t:0.1"),P), holds(P), on("t:0.1").
holds(neg(ehohe(z(alazu)))) :- fits(P,o("t:0.1")), holds(neg(P)), on("t:0.1").
fired("t:0.1",neg(ehohe(z(alazu)))) :- fits(P,o("t:0.1")), holds(neg(P)), on("t:0.1").
used("t:0.1",neg(ehohe(z(alazu))),neg(P)) :- fits(P,o("t:0.1")), holds(neg(P)), on("t:0.1").
% t:0.2
on("t:0.2").
holds(owuro(z(azozo))) :- on("t:0.2").
fired("t:0.2",owuro(z(azozo))) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(neg(ehohe(z(alazu)))) :- fits(P,c("t:0.3")), holds(neg(P)), on("t:0.3").
fired("t:0.3",neg(ehohe(z(alazu)))) :- fits(P,c("t:0.3")), holds(neg(P)), on("t:0.3").
used("t:0.3",neg(ehohe(z(alazu))),neg(P)) :- fits(P,c("t:0.3")), holds(neg(P)), on("t:0.3").
holds(owuro(z(azozo))) :- fits(o("t:0.3"),P), holds(P), on("t:0.3").
fired("t:0.3",owuro(z(azozo))) :- fits(o("t:0.3"),P), holds(P), on("t:0.3").
used("t:0.3",owuro(z(azozo)),P) :- fits(o("t:0.3"),P), holds(P), on("t:0.3").
% t:0.4
on("t:0.4").
holds(ehohe(z(alazu))) :- fits(c("t:0.4"),P), holds(P), on("t:0.4").
fired("t:0.4",ehohe(z(alazu))) :- fits(c("t:0.4"),P), holds(P), on("t:0.4").
used("t:0.4",ehohe(z(alazu)),P) :- fits(c("t:0.4"),P), holds(P), on("t:0.4").
holds(neg(owuro(z(azozo)))) :- fits(P,o("t:0.4")), holds(neg(P)), on("t:0.4").
fired("t:0.4",neg(owuro(z(azozo)))) :- fits(P,o("t:0.4")), holds(neg(P)), on("t:0.4").
used("t:0.4",neg(owuro(z(azozo))),neg(P)) :- fits(P,o("t:0.4")), holds(neg(P)), on("t:0.4").
holds(neg(ehohe(z(alazu)))) :- fits(P,c("t:0.4")), holds(neg(P)), on("t:0.4").
fired("t:0.4",neg(ehohe(z(alazu)))) :- fits(P,c("t:0.4")), holds(neg(P)), on("t:0.4").
used("t:0.4",neg(ehohe(z(alazu))),neg(P)) :- fits(P,c("t:0.4")), holds(neg(P)), on("t:0.4").
holds(owuro(z(azozo))) :- fits(o("t:0.4"),P), holds(P), on("t:0.4").
fired("t:0.4",owuro(z(azozo))) :- fits(o("t:0.4"),P), holds(P), on("t:0.4").
used("t:0.4",owuro(z(azozo)),P) :- fits(o("t:0.4"),P), holds(P), on("t:0.4").
% t:0.5
on("t:0.5").
holds(neg(owuro(z(azozo)))) :- on("t:0.5").
fired("t:0.5",neg(owuro(z(azozo)))) :- on("t:0.5").

% Fits, from match().
fits(c("t:0.0"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.0")).
fits(o("t:0.0"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.0")).
fits(c("t:0.1"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),c("t:0.1")).
fits(o("t:0.1"),ezuve(z(ahela))).
fits(ezuve(z(ahela)),o("t:0.1")).
fits(c("t:0.3"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.3")).
fits(o("t:0.3"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.3")).
fits(c("t:0.4"),owuro(z(azozo))).
fits(owuro(z(azozo)),c("t:0.4")).
fits(o("t:0.4"),ehohe(z(alazu))).
fits(ehohe(z(alazu)),o("t:0.4")).
