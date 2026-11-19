% t:0.0 = l1
% t:0.1 = l2
% t:0.2 = l3
% t:0.3 = l4

% Generic rules (clingo-solver E1).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).

% t:0.0
on("t:0.0").
holds(owuro(z(ls("t:0.0",z)))) :- on("t:0.0").
fired("t:0.0",owuro(z(ls("t:0.0",z)))) :- on("t:0.0").
holds(owuro(z(X))) :- member(ls("t:0.0",z),X,G), on("t:0.0").
fired("t:0.0",owuro(z(X))) :- member(ls("t:0.0",z),X,G), on("t:0.0").
% t:0.1
on("t:0.1").
holds(ayebe(z(ls("t:0.1",z)),d(ls("t:0.1",d)))) :- on("t:0.1").
fired("t:0.1",ayebe(z(ls("t:0.1",z)),d(ls("t:0.1",d)))) :- on("t:0.1").
holds(isa(nm("t:0.1",d1),ogoze)) :- on("t:0.1").
fired("t:0.1",isa(nm("t:0.1",d1),ogoze)) :- on("t:0.1").
holds(isa(nm("t:0.1",d2),odoze)) :- on("t:0.1").
fired("t:0.1",isa(nm("t:0.1",d2),odoze)) :- on("t:0.1").
holds(ayebe(z(X1),d(X2))) :- member(ls("t:0.1",z),X1,G), member(ls("t:0.1",d),X2,G), on("t:0.1").
fired("t:0.1",ayebe(z(X1),d(X2))) :- member(ls("t:0.1",z),X1,G), member(ls("t:0.1",d),X2,G), on("t:0.1").
% t:0.2
on("t:0.2").
holds(ayebe(z(ls("t:0.2",z)),d(ls("t:0.2",d)))) :- on("t:0.2").
fired("t:0.2",ayebe(z(ls("t:0.2",z)),d(ls("t:0.2",d)))) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(ehohe(z(ls("t:0.3",z)))) :- on("t:0.3").
fired("t:0.3",ehohe(z(ls("t:0.3",z)))) :- on("t:0.3").

% Members, from claimMemberLists().
member(ls("t:0.0",z),azozo,1).
member(ls("t:0.0",z),alazu,2).
member(ls("t:0.1",z),azozo,1).
member(ls("t:0.1",z),alazu,2).
member(ls("t:0.1",d),nm("t:0.1",d1),1).
member(ls("t:0.1",d),nm("t:0.1",d2),2).
