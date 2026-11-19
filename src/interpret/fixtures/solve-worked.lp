% t:0.0 = s1
% t:0.1 = s2
% t:0.2 = s3
% t:0.3 = s6

% Generic rules (clingo-solver E1).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).

% t:0.0
on("t:0.0").
{ holds(ewobo(z(X))) } :- holds(isa(X,ebeze)), not holds(neg(ewobo(z(X)))), on("t:0.0").
fired("t:0.0",ewobo(z(X))) :- holds(ewobo(z(X))), holds(isa(X,ebeze)), not holds(neg(ewobo(z(X)))), on("t:0.0").
used("t:0.0",ewobo(z(X)),isa(X,ebeze)) :- holds(ewobo(z(X))), holds(isa(X,ebeze)), not holds(neg(ewobo(z(X)))), on("t:0.0").
holds(ewobo(z(X))) :- holds(isa(X,ebeze)), not holds(neg(ewobo(z(X)))), switch(defaults), on("t:0.0").
fired("t:0.0",ewobo(z(X))) :- holds(isa(X,ebeze)), not holds(neg(ewobo(z(X)))), switch(defaults), on("t:0.0").
used("t:0.0",ewobo(z(X)),isa(X,ebeze)) :- holds(isa(X,ebeze)), not holds(neg(ewobo(z(X)))), switch(defaults), on("t:0.0").
% t:0.1
on("t:0.1").
holds(neg(ewobo(z(X)))) :- holds(isa(X,awoza)), on("t:0.1").
fired("t:0.1",neg(ewobo(z(X)))) :- holds(isa(X,awoza)), on("t:0.1").
used("t:0.1",neg(ewobo(z(X))),isa(X,awoza)) :- holds(isa(X,awoza)), on("t:0.1").
% t:0.2
on("t:0.2").
holds(isa(azozo,ls("t:0.2",g))) :- on("t:0.2").
fired("t:0.2",isa(azozo,ls("t:0.2",g))) :- on("t:0.2").
holds(isa(azozo,X)) :- member(ls("t:0.2",g),X,G), on("t:0.2").
fired("t:0.2",isa(azozo,X)) :- member(ls("t:0.2",g),X,G), on("t:0.2").
% t:0.3
on("t:0.3").
holds(isa(ahela,ebeze)) :- on("t:0.3").
fired("t:0.3",isa(ahela,ebeze)) :- on("t:0.3").

% Members, from claimMemberLists().
member(ls("t:0.2",g),awoza,1).
member(ls("t:0.2",g),ebeze,2).
