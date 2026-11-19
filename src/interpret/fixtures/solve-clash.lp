% t:0.0 = s1
% t:0.1 = s2
% t:0.2 = s3
% t:0.3 = s4
% t:0.4 = s5

% Generic rules (clingo-solver E1).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).

% t:0.0
on("t:0.0").
holds(ewobo(z(X))) :- holds(isa(X,ebeze)), on("t:0.0").
fired("t:0.0",ewobo(z(X))) :- holds(isa(X,ebeze)), on("t:0.0").
used("t:0.0",ewobo(z(X)),isa(X,ebeze)) :- holds(isa(X,ebeze)), on("t:0.0").
% t:0.1
on("t:0.1").
holds(neg(ewobo(z(X)))) :- holds(isa(X,oboza)), on("t:0.1").
fired("t:0.1",neg(ewobo(z(X)))) :- holds(isa(X,oboza)), on("t:0.1").
used("t:0.1",neg(ewobo(z(X))),isa(X,oboza)) :- holds(isa(X,oboza)), on("t:0.1").
% t:0.2
on("t:0.2").
holds(isa(azozo,ls("t:0.2",g))) :- on("t:0.2").
fired("t:0.2",isa(azozo,ls("t:0.2",g))) :- on("t:0.2").
holds(isa(azozo,X)) :- member(ls("t:0.2",g),X,G), on("t:0.2").
fired("t:0.2",isa(azozo,X)) :- member(ls("t:0.2",g),X,G), on("t:0.2").
% t:0.3
on("t:0.3").
holds(isa(alazu,ebeze)) :- on("t:0.3").
fired("t:0.3",isa(alazu,ebeze)) :- on("t:0.3").
% t:0.4
on("t:0.4").
holds(neg(ewobo(z(alazu)))) :- on("t:0.4").
fired("t:0.4",neg(ewobo(z(alazu)))) :- on("t:0.4").

% Members, from claimMemberLists().
member(ls("t:0.2",g),oboza,1).
member(ls("t:0.2",g),ebeze,2).
