% t:0.0 = f1
% t:0.1 = f2
% t:0.2 = f3
% t:0.3 = f4
% t:0.4 = f5
% t:0.5 = f6
% t:0.6 = f7
% t:0.7 = f8
% t:0.8 = f9
% t:0.9 = f10
% t:0.10 = f11

% Generic rules (docs/meta/solver.md).
clash(P) :- holds(P), holds(neg(P)).
clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).
holds(neg(P)) :- candidate(P), not holds(P), switch(closed).
% A holder's view (R2-1 row 1, R2-2): one holder's views clash; two holders' never do, nor a view and your claim.
clash(view(H, P)) :- holds(view(H, P)), holds(view(H, neg(P))).
clash(view(H, Q)) :- holds(view(H, neg(Q))), holds(view(H, P)), fits(Q, P).
% Rank and ties (R4c decision 1, R4c-2, D17): a rank one way and the other, or a closed tie and a rank, on one scale.
clash(more(S, B, A)) :- holds(more(S, A, B)), holds(more(S, B, A)).
clash(tie(S, A, B, l)) :- holds(tie(S, A, B, l)), holds(more(S, A, B)).
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
% A ban denies the matching permission (permission-consent.md#requirement).
holds(neg(say(W, P, R, a, E, T))) :- holds(say(W, P, R, u, E, T)).
fired(bans, neg(say(W, P, R, a, E, T))) :- holds(say(W, P, R, u, E, T)).
used(bans, neg(say(W, P, R, a, E, T)), say(W, P, R, u, E, T)) :- holds(say(W, P, R, u, E, T)).
holds(neg(say(W, P, R, a, E, Q))) :- holds(say(W, P, R, u, E, T)), fits(T, Q).
fired(bans, neg(say(W, P, R, a, E, Q))) :- holds(say(W, P, R, u, E, T)), fits(T, Q).
used(bans, neg(say(W, P, R, a, E, Q)), say(W, P, R, u, E, T)) :- holds(say(W, P, R, u, E, T)), fits(T, Q).
holds(neg(say(W, P, R, a, E, T, X))) :- holds(say(W, P, R, u, E, T, X)).
fired(bans, neg(say(W, P, R, a, E, T, X))) :- holds(say(W, P, R, u, E, T, X)).
used(bans, neg(say(W, P, R, a, E, T, X)), say(W, P, R, u, E, T, X)) :- holds(say(W, P, R, u, E, T, X)).
holds(neg(say(W, P, R, a, E, Q, X))) :- holds(say(W, P, R, u, E, T, X)), fits(T, Q).
fired(bans, neg(say(W, P, R, a, E, Q, X))) :- holds(say(W, P, R, u, E, T, X)), fits(T, Q).
used(bans, neg(say(W, P, R, a, E, Q, X)), say(W, P, R, u, E, T, X)) :- holds(say(W, P, R, u, E, T, X)), fits(T, Q).
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
holds(owuro(z(sp("a")))) :- on("t:0.0").
fired("t:0.0",owuro(z(sp("a")))) :- on("t:0.0").
% t:0.1
on("t:0.1").
holds(neg(owuro(z(sp("a"))))) :- on("t:0.1").
fired("t:0.1",neg(owuro(z(sp("a"))))) :- on("t:0.1").
% t:0.2
on("t:0.2").
holds(owuro(z(listener(2)))) :- on("t:0.2").
fired("t:0.2",owuro(z(listener(2)))) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(neg(owuro(z(listener(3))))) :- on("t:0.3").
fired("t:0.3",neg(owuro(z(listener(3))))) :- on("t:0.3").
% t:0.4
on("t:0.4").
holds(owuro(z(X))) :- holds(isa(X,ogoze)), on("t:0.4").
fired("t:0.4",owuro(z(X))) :- holds(isa(X,ogoze)), on("t:0.4").
used("t:0.4",owuro(z(X)),isa(X,ogoze)) :- holds(isa(X,ogoze)), on("t:0.4").
% t:0.5
on("t:0.5").
holds(isa(ahela,ogoze)) :- on("t:0.5").
fired("t:0.5",isa(ahela,ogoze)) :- on("t:0.5").
% t:0.6
on("t:0.6").
holds(owuro(z(ls("t:0.6",z)))) :- on("t:0.6").
fired("t:0.6",owuro(z(ls("t:0.6",z)))) :- on("t:0.6").
holds(isa(nm("t:0.6",z1),odoze)) :- on("t:0.6").
fired("t:0.6",isa(nm("t:0.6",z1),odoze)) :- on("t:0.6").
detail(nm("t:0.6",z1),dt("slot:adj","gamayam")) :- on("t:0.6").
fired("t:0.6",detail(nm("t:0.6",z1),dt("slot:adj","gamayam"))) :- on("t:0.6").
holds(isa(nm("t:0.6",z2),ogoze)) :- on("t:0.6").
fired("t:0.6",isa(nm("t:0.6",z2),ogoze)) :- on("t:0.6").
detail(nm("t:0.6",z2),dt("slot:adj","gamayam")) :- on("t:0.6").
fired("t:0.6",detail(nm("t:0.6",z2),dt("slot:adj","gamayam"))) :- on("t:0.6").
holds(owuro(z(X))) :- member(ls("t:0.6",z),X,G), on("t:0.6").
fired("t:0.6",owuro(z(X))) :- member(ls("t:0.6",z),X,G), on("t:0.6").
% t:0.7
on("t:0.7").
holds(isa(ls("t:0.7",z),amaya)) :- on("t:0.7").
fired("t:0.7",isa(ls("t:0.7",z),amaya)) :- on("t:0.7").
holds(isa(X,amaya)) :- member(ls("t:0.7",z),X,G), on("t:0.7").
fired("t:0.7",isa(X,amaya)) :- member(ls("t:0.7",z),X,G), on("t:0.7").
% t:0.8
on("t:0.8").
{ holds(owuro(z(azozo))) } :- on("t:0.8").
fired("t:0.8",owuro(z(azozo))) :- holds(owuro(z(azozo))), on("t:0.8").
{ holds(eruvo(z(azozo))) } :- on("t:0.8").
fired("t:0.8",eruvo(z(azozo))) :- holds(eruvo(z(azozo))), on("t:0.8").
some("t:0.8") :- fits(i("t:0.8",1),P1), holds(P1), on("t:0.8").
fired("t:0.8",some("t:0.8")) :- fits(i("t:0.8",1),P1), holds(P1), on("t:0.8").
used("t:0.8",some("t:0.8"),P1) :- fits(i("t:0.8",1),P1), holds(P1), on("t:0.8").
some("t:0.8") :- fits(i("t:0.8",2),P2), holds(P2), on("t:0.8").
fired("t:0.8",some("t:0.8")) :- fits(i("t:0.8",2),P2), holds(P2), on("t:0.8").
used("t:0.8",some("t:0.8"),P2) :- fits(i("t:0.8",2),P2), holds(P2), on("t:0.8").
clash(noneof("t:0.8")) :- not some("t:0.8"), on("t:0.8").
fired("t:0.8",noneof("t:0.8")) :- not some("t:0.8"), on("t:0.8").
holds(owuro(z(azozo))) :- fits(N2,i("t:0.8",2)), holds(neg(N2)), on("t:0.8").
fired("t:0.8",owuro(z(azozo))) :- fits(N2,i("t:0.8",2)), holds(neg(N2)), on("t:0.8").
used("t:0.8",owuro(z(azozo)),neg(N2)) :- fits(N2,i("t:0.8",2)), holds(neg(N2)), on("t:0.8").
holds(eruvo(z(azozo))) :- fits(N1,i("t:0.8",1)), holds(neg(N1)), on("t:0.8").
fired("t:0.8",eruvo(z(azozo))) :- fits(N1,i("t:0.8",1)), holds(neg(N1)), on("t:0.8").
used("t:0.8",eruvo(z(azozo)),neg(N1)) :- fits(N1,i("t:0.8",1)), holds(neg(N1)), on("t:0.8").
% t:0.9
on("t:0.9").
holds(neg(owuro(z(azozo)))) :- on("t:0.9").
fired("t:0.9",neg(owuro(z(azozo)))) :- on("t:0.9").
% t:0.10
on("t:0.10").
holds(neg(eruvo(z(azozo)))) :- on("t:0.10").
fired("t:0.10",neg(eruvo(z(azozo)))) :- on("t:0.10").

% Fits, from match().
fits(i("t:0.8",1),owuro(z(azozo))).
fits(owuro(z(azozo)),i("t:0.8",1)).
fits(i("t:0.8",2),eruvo(z(azozo))).
fits(eruvo(z(azozo)),i("t:0.8",2)).

% Members, from claimMemberLists().
member(ls("t:0.6",z),nm("t:0.6",z1),1).
member(ls("t:0.6",z),nm("t:0.6",z2),2).
member(ls("t:0.7",z),azozo,1).
member(ls("t:0.7",z),alazu,2).
