% t:0.0 = o1
% t:0.1 = o2
% t:0.2 = o3
% t:0.3 = o4
% t:0.4 = o5
% t:0.5 = o6
% t:0.6 = o7
% t:0.7 = o8
% t:0.8 = o9
% t:0.9 = o10
% t:0.10 = o11
% t:0.11 = o12
% t:0.12 = o13
% t:0.13 = o14
% t:0.14 = o15

% Generic rules (clingo-solver E1).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).
% A holder's view (R2-1 row 1, R2-2): one holder's views clash; two holders' never do, nor a view and your claim.
clash(view(H, P)) :- holds(view(H, P)), holds(view(H, neg(P))).
clash(view(H, Q)) :- holds(view(H, neg(Q))), holds(view(H, P)), fits(Q, P).
% Say words (R2-7): the same party, part, reach and ending, allow or require against forbid; e clashes with nothing.
clash(say(W, P, R, u, E, T)) :- holds(say(W, P, R, a, E, T)), holds(say(W, P, R, u, E, T)).
clash(say(W, P, R, u, E, T)) :- holds(say(W, P, R, o, E, T)), holds(say(W, P, R, u, E, T)).
clash(say(W, P, R, u, E, Q)) :- holds(say(W, P, R, a, E, T)), holds(say(W, P, R, u, E, Q)), fits(Q, T).
clash(say(W, P, R, u, E, Q)) :- holds(say(W, P, R, o, E, T)), holds(say(W, P, R, u, E, Q)), fits(Q, T).
clash(say(W, P, R, u, E, T, X)) :- holds(say(W, P, R, a, E, T, X)), holds(say(W, P, R, u, E, T, X)).
clash(say(W, P, R, u, E, T, X)) :- holds(say(W, P, R, o, E, T, X)), holds(say(W, P, R, u, E, T, X)).
clash(say(W, P, R, u, E, Q, X)) :- holds(say(W, P, R, a, E, T, X)), holds(say(W, P, R, u, E, Q, X)), fits(Q, T).
clash(say(W, P, R, u, E, Q, X)) :- holds(say(W, P, R, o, E, T, X)), holds(say(W, P, R, u, E, Q, X)), fits(Q, T).
% A requirement gives permission (R2-8).
holds(say(W, P, R, a, E, T)) :- holds(say(W, P, R, o, E, T)).
fired(requires, say(W, P, R, a, E, T)) :- holds(say(W, P, R, o, E, T)).
used(requires, say(W, P, R, a, E, T), say(W, P, R, o, E, T)) :- holds(say(W, P, R, o, E, T)).
holds(say(W, P, R, a, E, T, X)) :- holds(say(W, P, R, o, E, T, X)).
fired(requires, say(W, P, R, a, E, T, X)) :- holds(say(W, P, R, o, E, T, X)).
used(requires, say(W, P, R, a, E, T, X), say(W, P, R, o, E, T, X)) :- holds(say(W, P, R, o, E, T, X)).
% An act against a stated ban (R2-9): data, never a clash.
holds(against(T, say(W, P, R, u, E))) :- holds(T), holds(say(W, P, R, u, E, T)).
fired(against, against(T, say(W, P, R, u, E))) :- holds(T), holds(say(W, P, R, u, E, T)).
used(against, against(T, say(W, P, R, u, E)), T) :- holds(T), holds(say(W, P, R, u, E, T)).
used(against, against(T, say(W, P, R, u, E)), say(W, P, R, u, E, T)) :- holds(T), holds(say(W, P, R, u, E, T)).
holds(against(T, say(W, P, R, u, E))) :- holds(T), holds(say(W, P, R, u, E, Q)), fits(Q, T).
fired(against, against(T, say(W, P, R, u, E))) :- holds(T), holds(say(W, P, R, u, E, Q)), fits(Q, T).
used(against, against(T, say(W, P, R, u, E)), T) :- holds(T), holds(say(W, P, R, u, E, Q)), fits(Q, T).
used(against, against(T, say(W, P, R, u, E)), say(W, P, R, u, E, Q)) :- holds(T), holds(say(W, P, R, u, E, Q)), fits(Q, T).
holds(against(T, say(W, P, R, u, E, X))) :- holds(T), holds(say(W, P, R, u, E, T, X)).
fired(against, against(T, say(W, P, R, u, E, X))) :- holds(T), holds(say(W, P, R, u, E, T, X)).
used(against, against(T, say(W, P, R, u, E, X)), T) :- holds(T), holds(say(W, P, R, u, E, T, X)).
used(against, against(T, say(W, P, R, u, E, X)), say(W, P, R, u, E, T, X)) :- holds(T), holds(say(W, P, R, u, E, T, X)).
holds(against(T, say(W, P, R, u, E, X))) :- holds(T), holds(say(W, P, R, u, E, Q, X)), fits(Q, T).
fired(against, against(T, say(W, P, R, u, E, X))) :- holds(T), holds(say(W, P, R, u, E, Q, X)), fits(Q, T).
used(against, against(T, say(W, P, R, u, E, X)), T) :- holds(T), holds(say(W, P, R, u, E, Q, X)), fits(Q, T).
used(against, against(T, say(W, P, R, u, E, X)), say(W, P, R, u, E, Q, X)) :- holds(T), holds(say(W, P, R, u, E, Q, X)), fits(Q, T).

% t:0.0
on("t:0.0").
{ holds(owuro(z(azozo))) } :- on("t:0.0").
fired("t:0.0",owuro(z(azozo))) :- holds(owuro(z(azozo))), on("t:0.0").
{ holds(eruvo(z(azozo))) } :- on("t:0.0").
fired("t:0.0",eruvo(z(azozo))) :- holds(eruvo(z(azozo))), on("t:0.0").
some("t:0.0") :- fits(i("t:0.0",1),P1), holds(P1), on("t:0.0").
fired("t:0.0",some("t:0.0")) :- fits(i("t:0.0",1),P1), holds(P1), on("t:0.0").
used("t:0.0",some("t:0.0"),P1) :- fits(i("t:0.0",1),P1), holds(P1), on("t:0.0").
some("t:0.0") :- fits(i("t:0.0",2),P2), holds(P2), on("t:0.0").
fired("t:0.0",some("t:0.0")) :- fits(i("t:0.0",2),P2), holds(P2), on("t:0.0").
used("t:0.0",some("t:0.0"),P2) :- fits(i("t:0.0",2),P2), holds(P2), on("t:0.0").
clash(noneof("t:0.0")) :- not some("t:0.0"), on("t:0.0").
fired("t:0.0",noneof("t:0.0")) :- not some("t:0.0"), on("t:0.0").
holds(owuro(z(azozo))) :- fits(N2,i("t:0.0",2)), holds(neg(N2)), on("t:0.0").
fired("t:0.0",owuro(z(azozo))) :- fits(N2,i("t:0.0",2)), holds(neg(N2)), on("t:0.0").
used("t:0.0",owuro(z(azozo)),neg(N2)) :- fits(N2,i("t:0.0",2)), holds(neg(N2)), on("t:0.0").
holds(eruvo(z(azozo))) :- fits(N1,i("t:0.0",1)), holds(neg(N1)), on("t:0.0").
fired("t:0.0",eruvo(z(azozo))) :- fits(N1,i("t:0.0",1)), holds(neg(N1)), on("t:0.0").
used("t:0.0",eruvo(z(azozo)),neg(N1)) :- fits(N1,i("t:0.0",1)), holds(neg(N1)), on("t:0.0").
holds(neg(eruvo(z(azozo)))) :- fits(i("t:0.0",1),P1), holds(P1), on("t:0.0").
fired("t:0.0",neg(eruvo(z(azozo)))) :- fits(i("t:0.0",1),P1), holds(P1), on("t:0.0").
used("t:0.0",neg(eruvo(z(azozo))),P1) :- fits(i("t:0.0",1),P1), holds(P1), on("t:0.0").
holds(neg(owuro(z(azozo)))) :- fits(i("t:0.0",2),P2), holds(P2), on("t:0.0").
fired("t:0.0",neg(owuro(z(azozo)))) :- fits(i("t:0.0",2),P2), holds(P2), on("t:0.0").
used("t:0.0",neg(owuro(z(azozo))),P2) :- fits(i("t:0.0",2),P2), holds(P2), on("t:0.0").
% t:0.1
on("t:0.1").
{ holds(owuro(z(azozo))) } :- on("t:0.1").
fired("t:0.1",owuro(z(azozo))) :- holds(owuro(z(azozo))), on("t:0.1").
{ holds(eruvo(z(azozo))) } :- on("t:0.1").
fired("t:0.1",eruvo(z(azozo))) :- holds(eruvo(z(azozo))), on("t:0.1").
some("t:0.1") :- fits(i("t:0.1",1),P1), holds(P1), on("t:0.1").
fired("t:0.1",some("t:0.1")) :- fits(i("t:0.1",1),P1), holds(P1), on("t:0.1").
used("t:0.1",some("t:0.1"),P1) :- fits(i("t:0.1",1),P1), holds(P1), on("t:0.1").
some("t:0.1") :- fits(i("t:0.1",2),P2), holds(P2), on("t:0.1").
fired("t:0.1",some("t:0.1")) :- fits(i("t:0.1",2),P2), holds(P2), on("t:0.1").
used("t:0.1",some("t:0.1"),P2) :- fits(i("t:0.1",2),P2), holds(P2), on("t:0.1").
clash(noneof("t:0.1")) :- not some("t:0.1"), on("t:0.1").
fired("t:0.1",noneof("t:0.1")) :- not some("t:0.1"), on("t:0.1").
holds(owuro(z(azozo))) :- fits(N2,i("t:0.1",2)), holds(neg(N2)), on("t:0.1").
fired("t:0.1",owuro(z(azozo))) :- fits(N2,i("t:0.1",2)), holds(neg(N2)), on("t:0.1").
used("t:0.1",owuro(z(azozo)),neg(N2)) :- fits(N2,i("t:0.1",2)), holds(neg(N2)), on("t:0.1").
holds(eruvo(z(azozo))) :- fits(N1,i("t:0.1",1)), holds(neg(N1)), on("t:0.1").
fired("t:0.1",eruvo(z(azozo))) :- fits(N1,i("t:0.1",1)), holds(neg(N1)), on("t:0.1").
used("t:0.1",eruvo(z(azozo)),neg(N1)) :- fits(N1,i("t:0.1",1)), holds(neg(N1)), on("t:0.1").
% t:0.2
on("t:0.2").
{ holds(owuro(z(azozo))) } :- on("t:0.2").
fired("t:0.2",owuro(z(azozo))) :- holds(owuro(z(azozo))), on("t:0.2").
{ holds(eruvo(z(azozo))) } :- on("t:0.2").
fired("t:0.2",eruvo(z(azozo))) :- holds(eruvo(z(azozo))), on("t:0.2").
holds(neg(eruvo(z(azozo)))) :- fits(i("t:0.2",1),P1), holds(P1), on("t:0.2").
fired("t:0.2",neg(eruvo(z(azozo)))) :- fits(i("t:0.2",1),P1), holds(P1), on("t:0.2").
used("t:0.2",neg(eruvo(z(azozo))),P1) :- fits(i("t:0.2",1),P1), holds(P1), on("t:0.2").
holds(neg(owuro(z(azozo)))) :- fits(i("t:0.2",2),P2), holds(P2), on("t:0.2").
fired("t:0.2",neg(owuro(z(azozo)))) :- fits(i("t:0.2",2),P2), holds(P2), on("t:0.2").
used("t:0.2",neg(owuro(z(azozo))),P2) :- fits(i("t:0.2",2),P2), holds(P2), on("t:0.2").
% t:0.3
on("t:0.3").
holds(neg(owuro(z(azozo)))) :- on("t:0.3").
fired("t:0.3",neg(owuro(z(azozo)))) :- on("t:0.3").
% t:0.4
on("t:0.4").
holds(neg(eruvo(z(azozo)))) :- on("t:0.4").
fired("t:0.4",neg(eruvo(z(azozo)))) :- on("t:0.4").
% t:0.5
on("t:0.5").
holds(owuro(z(azozo))) :- on("t:0.5").
fired("t:0.5",owuro(z(azozo))) :- on("t:0.5").
% t:0.6
on("t:0.6").
{ holds(owuro(z(azozo))) } :- on("t:0.6").
fired("t:0.6",owuro(z(azozo))) :- holds(owuro(z(azozo))), on("t:0.6").
{ holds(owuro(z(alazu))) } :- on("t:0.6").
fired("t:0.6",owuro(z(alazu))) :- holds(owuro(z(alazu))), on("t:0.6").
some("t:0.6") :- fits(i("t:0.6",1),P1), holds(P1), on("t:0.6").
fired("t:0.6",some("t:0.6")) :- fits(i("t:0.6",1),P1), holds(P1), on("t:0.6").
used("t:0.6",some("t:0.6"),P1) :- fits(i("t:0.6",1),P1), holds(P1), on("t:0.6").
some("t:0.6") :- fits(i("t:0.6",2),P2), holds(P2), on("t:0.6").
fired("t:0.6",some("t:0.6")) :- fits(i("t:0.6",2),P2), holds(P2), on("t:0.6").
used("t:0.6",some("t:0.6"),P2) :- fits(i("t:0.6",2),P2), holds(P2), on("t:0.6").
clash(noneof("t:0.6")) :- not some("t:0.6"), on("t:0.6").
fired("t:0.6",noneof("t:0.6")) :- not some("t:0.6"), on("t:0.6").
holds(owuro(z(azozo))) :- fits(N2,i("t:0.6",2)), holds(neg(N2)), on("t:0.6").
fired("t:0.6",owuro(z(azozo))) :- fits(N2,i("t:0.6",2)), holds(neg(N2)), on("t:0.6").
used("t:0.6",owuro(z(azozo)),neg(N2)) :- fits(N2,i("t:0.6",2)), holds(neg(N2)), on("t:0.6").
holds(owuro(z(alazu))) :- fits(N1,i("t:0.6",1)), holds(neg(N1)), on("t:0.6").
fired("t:0.6",owuro(z(alazu))) :- fits(N1,i("t:0.6",1)), holds(neg(N1)), on("t:0.6").
used("t:0.6",owuro(z(alazu)),neg(N1)) :- fits(N1,i("t:0.6",1)), holds(neg(N1)), on("t:0.6").
holds(neg(owuro(z(alazu)))) :- fits(i("t:0.6",1),P1), holds(P1), on("t:0.6").
fired("t:0.6",neg(owuro(z(alazu)))) :- fits(i("t:0.6",1),P1), holds(P1), on("t:0.6").
used("t:0.6",neg(owuro(z(alazu))),P1) :- fits(i("t:0.6",1),P1), holds(P1), on("t:0.6").
holds(neg(owuro(z(azozo)))) :- fits(i("t:0.6",2),P2), holds(P2), on("t:0.6").
fired("t:0.6",neg(owuro(z(azozo)))) :- fits(i("t:0.6",2),P2), holds(P2), on("t:0.6").
used("t:0.6",neg(owuro(z(azozo))),P2) :- fits(i("t:0.6",2),P2), holds(P2), on("t:0.6").
% t:0.7
on("t:0.7").
{ holds(isa(ahela,ogoze)) } :- on("t:0.7").
fired("t:0.7",isa(ahela,ogoze)) :- holds(isa(ahela,ogoze)), on("t:0.7").
{ holds(isa(ahela,odoze)) } :- on("t:0.7").
fired("t:0.7",isa(ahela,odoze)) :- holds(isa(ahela,odoze)), on("t:0.7").
some("t:0.7") :- fits(i("t:0.7",1),P1), holds(P1), on("t:0.7").
fired("t:0.7",some("t:0.7")) :- fits(i("t:0.7",1),P1), holds(P1), on("t:0.7").
used("t:0.7",some("t:0.7"),P1) :- fits(i("t:0.7",1),P1), holds(P1), on("t:0.7").
some("t:0.7") :- fits(i("t:0.7",2),P2), holds(P2), on("t:0.7").
fired("t:0.7",some("t:0.7")) :- fits(i("t:0.7",2),P2), holds(P2), on("t:0.7").
used("t:0.7",some("t:0.7"),P2) :- fits(i("t:0.7",2),P2), holds(P2), on("t:0.7").
clash(noneof("t:0.7")) :- not some("t:0.7"), on("t:0.7").
fired("t:0.7",noneof("t:0.7")) :- not some("t:0.7"), on("t:0.7").
holds(isa(ahela,ogoze)) :- fits(N2,i("t:0.7",2)), holds(neg(N2)), on("t:0.7").
fired("t:0.7",isa(ahela,ogoze)) :- fits(N2,i("t:0.7",2)), holds(neg(N2)), on("t:0.7").
used("t:0.7",isa(ahela,ogoze),neg(N2)) :- fits(N2,i("t:0.7",2)), holds(neg(N2)), on("t:0.7").
holds(isa(ahela,odoze)) :- fits(N1,i("t:0.7",1)), holds(neg(N1)), on("t:0.7").
fired("t:0.7",isa(ahela,odoze)) :- fits(N1,i("t:0.7",1)), holds(neg(N1)), on("t:0.7").
used("t:0.7",isa(ahela,odoze),neg(N1)) :- fits(N1,i("t:0.7",1)), holds(neg(N1)), on("t:0.7").
holds(neg(isa(ahela,odoze))) :- fits(i("t:0.7",1),P1), holds(P1), on("t:0.7").
fired("t:0.7",neg(isa(ahela,odoze))) :- fits(i("t:0.7",1),P1), holds(P1), on("t:0.7").
used("t:0.7",neg(isa(ahela,odoze)),P1) :- fits(i("t:0.7",1),P1), holds(P1), on("t:0.7").
holds(neg(isa(ahela,ogoze))) :- fits(i("t:0.7",2),P2), holds(P2), on("t:0.7").
fired("t:0.7",neg(isa(ahela,ogoze))) :- fits(i("t:0.7",2),P2), holds(P2), on("t:0.7").
used("t:0.7",neg(isa(ahela,ogoze)),P2) :- fits(i("t:0.7",2),P2), holds(P2), on("t:0.7").
% t:0.8
on("t:0.8").
holds(ezuve(z(X))) :- holds(isa(X,ogoze)), on("t:0.8").
fired("t:0.8",ezuve(z(X))) :- holds(isa(X,ogoze)), on("t:0.8").
used("t:0.8",ezuve(z(X)),isa(X,ogoze)) :- holds(isa(X,ogoze)), on("t:0.8").
% t:0.9
on("t:0.9").
holds(owuro(z(X))) :- holds(isa(X,odoze)), on("t:0.9").
fired("t:0.9",owuro(z(X))) :- holds(isa(X,odoze)), on("t:0.9").
used("t:0.9",owuro(z(X)),isa(X,odoze)) :- holds(isa(X,odoze)), on("t:0.9").
% t:0.10
on("t:0.10").
holds(neg(ezuve(z(ahela)))) :- on("t:0.10").
fired("t:0.10",neg(ezuve(z(ahela)))) :- on("t:0.10").
% t:0.11
on("t:0.11").
holds(neg(owuro(z(ahela)))) :- on("t:0.11").
fired("t:0.11",neg(owuro(z(ahela)))) :- on("t:0.11").
% t:0.12
on("t:0.12").
{ holds(ezuve(z(X))) } :- holds(isa(X,ogoze)), not holds(neg(ezuve(z(X)))), on("t:0.12").
fired("t:0.12",ezuve(z(X))) :- holds(ezuve(z(X))), holds(isa(X,ogoze)), not holds(neg(ezuve(z(X)))), on("t:0.12").
used("t:0.12",ezuve(z(X)),isa(X,ogoze)) :- holds(ezuve(z(X))), holds(isa(X,ogoze)), not holds(neg(ezuve(z(X)))), on("t:0.12").
holds(ezuve(z(X))) :- holds(isa(X,ogoze)), not holds(neg(ezuve(z(X)))), switch(defaults), on("t:0.12").
fired("t:0.12",ezuve(z(X))) :- holds(isa(X,ogoze)), not holds(neg(ezuve(z(X)))), switch(defaults), on("t:0.12").
used("t:0.12",ezuve(z(X)),isa(X,ogoze)) :- holds(isa(X,ogoze)), not holds(neg(ezuve(z(X)))), switch(defaults), on("t:0.12").
% t:0.13
on("t:0.13").
clash(notone("t:0.13")) :- fits(i("t:0.13",1),P1), holds(P1), fits(N2,i("t:0.13",2)), holds(neg(N2)), on("t:0.13").
fired("t:0.13",notone("t:0.13")) :- fits(i("t:0.13",1),P1), holds(P1), fits(N2,i("t:0.13",2)), holds(neg(N2)), on("t:0.13").
used("t:0.13",notone("t:0.13"),P1) :- fits(i("t:0.13",1),P1), holds(P1), fits(N2,i("t:0.13",2)), holds(neg(N2)), on("t:0.13").
used("t:0.13",notone("t:0.13"),neg(N2)) :- fits(i("t:0.13",1),P1), holds(P1), fits(N2,i("t:0.13",2)), holds(neg(N2)), on("t:0.13").
clash(notone("t:0.13")) :- fits(i("t:0.13",2),P2), holds(P2), fits(N1,i("t:0.13",1)), holds(neg(N1)), on("t:0.13").
fired("t:0.13",notone("t:0.13")) :- fits(i("t:0.13",2),P2), holds(P2), fits(N1,i("t:0.13",1)), holds(neg(N1)), on("t:0.13").
used("t:0.13",notone("t:0.13"),P2) :- fits(i("t:0.13",2),P2), holds(P2), fits(N1,i("t:0.13",1)), holds(neg(N1)), on("t:0.13").
used("t:0.13",notone("t:0.13"),neg(N1)) :- fits(i("t:0.13",2),P2), holds(P2), fits(N1,i("t:0.13",1)), holds(neg(N1)), on("t:0.13").
holds(eruvo(z(azozo))) :- fits(i("t:0.13",1),P1), holds(P1), on("t:0.13").
fired("t:0.13",eruvo(z(azozo))) :- fits(i("t:0.13",1),P1), holds(P1), on("t:0.13").
used("t:0.13",eruvo(z(azozo)),P1) :- fits(i("t:0.13",1),P1), holds(P1), on("t:0.13").
holds(neg(eruvo(z(azozo)))) :- fits(N1,i("t:0.13",1)), holds(neg(N1)), on("t:0.13").
fired("t:0.13",neg(eruvo(z(azozo)))) :- fits(N1,i("t:0.13",1)), holds(neg(N1)), on("t:0.13").
used("t:0.13",neg(eruvo(z(azozo))),neg(N1)) :- fits(N1,i("t:0.13",1)), holds(neg(N1)), on("t:0.13").
holds(owuro(z(azozo))) :- fits(i("t:0.13",2),P2), holds(P2), on("t:0.13").
fired("t:0.13",owuro(z(azozo))) :- fits(i("t:0.13",2),P2), holds(P2), on("t:0.13").
used("t:0.13",owuro(z(azozo)),P2) :- fits(i("t:0.13",2),P2), holds(P2), on("t:0.13").
holds(neg(owuro(z(azozo)))) :- fits(N2,i("t:0.13",2)), holds(neg(N2)), on("t:0.13").
fired("t:0.13",neg(owuro(z(azozo)))) :- fits(N2,i("t:0.13",2)), holds(neg(N2)), on("t:0.13").
used("t:0.13",neg(owuro(z(azozo))),neg(N2)) :- fits(N2,i("t:0.13",2)), holds(neg(N2)), on("t:0.13").
% t:0.14
on("t:0.14").
holds(neg(owuro(z(azozo)))) :- on("t:0.14").
fired("t:0.14",neg(owuro(z(azozo)))) :- on("t:0.14").
holds(neg(eruvo(z(azozo)))) :- on("t:0.14").
fired("t:0.14",neg(eruvo(z(azozo)))) :- on("t:0.14").

% Fits, from match().
fits(i("t:0.0",1),owuro(z(azozo))).
fits(owuro(z(azozo)),i("t:0.0",1)).
fits(i("t:0.0",2),eruvo(z(azozo))).
fits(eruvo(z(azozo)),i("t:0.0",2)).
fits(i("t:0.1",1),owuro(z(azozo))).
fits(owuro(z(azozo)),i("t:0.1",1)).
fits(i("t:0.1",2),eruvo(z(azozo))).
fits(eruvo(z(azozo)),i("t:0.1",2)).
fits(i("t:0.2",1),owuro(z(azozo))).
fits(owuro(z(azozo)),i("t:0.2",1)).
fits(i("t:0.2",2),eruvo(z(azozo))).
fits(eruvo(z(azozo)),i("t:0.2",2)).
fits(i("t:0.6",1),owuro(z(azozo))).
fits(owuro(z(azozo)),i("t:0.6",1)).
fits(i("t:0.6",2),owuro(z(alazu))).
fits(owuro(z(alazu)),i("t:0.6",2)).
fits(i("t:0.7",1),isa(ahela,ogoze)).
fits(isa(ahela,ogoze),i("t:0.7",1)).
fits(i("t:0.7",2),isa(ahela,odoze)).
fits(isa(ahela,odoze),i("t:0.7",2)).
fits(i("t:0.13",1),owuro(z(azozo))).
fits(owuro(z(azozo)),i("t:0.13",1)).
fits(i("t:0.13",2),eruvo(z(azozo))).
fits(eruvo(z(azozo)),i("t:0.13",2)).
