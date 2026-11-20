% t:0.0 = p1
% t:0.1 = p2
% t:0.2 = p3
% t:0.3 = p4
% t:0.4 = p5
% t:0.5 = p6
% t:0.6 = p7
% t:0.7 = p8
% t:0.8 = p9
% t:0.9 = k53
% t:0.10 = k38
% t:0.11 = k54
% t:0.12 = k40
% t:0.13 = k41
% t:0.14 = k42
% t:0.15 = k43
% t:0.16 = k44
% t:0.17 = k45
% t:0.18 = k46
% t:0.19 = k37
% t:0.20 = k47
% t:0.21 = k48
% t:0.22 = k49
% t:0.23 = k50
% t:0.24 = undefined

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
% A place on a scale (D22): one place per member and scale, and a place below the top denies the top.
clash(place(S, A, M)) :- holds(place(S, A, N)), holds(place(S, A, M)), N != M.
holds(neg(most(S, A))) :- holds(place(S, A, N)), N != rk(1).
fired(place, neg(most(S, A))) :- holds(place(S, A, N)), N != rk(1).
used(place, neg(most(S, A)), place(S, A, N)) :- holds(place(S, A, N)), N != rk(1).
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
holds(say(rules,v,u,a,l,owuro(z(azozo)))) :- on("t:0.0").
fired("t:0.0",say(rules,v,u,a,l,owuro(z(azozo)))) :- on("t:0.0").
% t:0.1
on("t:0.1").
holds(say(rules,v,u,u,l,owuro(z(azozo)))) :- on("t:0.1").
fired("t:0.1",say(rules,v,u,u,l,owuro(z(azozo)))) :- on("t:0.1").
% t:0.2
on("t:0.2").
holds(owuro(z(azozo))) :- on("t:0.2").
fired("t:0.2",owuro(z(azozo))) :- on("t:0.2").
% t:0.3
on("t:0.3").
holds(say(alazu,v,u,a,m,owuro(z(azozo)))) :- on("t:0.3").
fired("t:0.3",say(alazu,v,u,a,m,owuro(z(azozo)))) :- on("t:0.3").
% t:0.4
on("t:0.4").
holds(say(ahela,v,u,u,m,owuro(z(azozo)))) :- on("t:0.4").
fired("t:0.4",say(ahela,v,u,u,m,owuro(z(azozo)))) :- on("t:0.4").
% t:0.5
on("t:0.5").
holds(say(alazu,d,u,a,m,ayebe(z(azozo),d(alazu)))) :- on("t:0.5").
fired("t:0.5",say(alazu,d,u,a,m,ayebe(z(azozo),d(alazu)))) :- on("t:0.5").
% t:0.6
on("t:0.6").
holds(say(rules,v,u,o,l,owuro(z(azozo)))) :- on("t:0.6").
fired("t:0.6",say(rules,v,u,o,l,owuro(z(azozo)))) :- on("t:0.6").
% t:0.7
on("t:0.7").
holds(say(sp("a"),v,o,a,m,owuro(z(azozo)))) :- on("t:0.7").
fired("t:0.7",say(sp("a"),v,o,a,m,owuro(z(azozo)))) :- on("t:0.7").
% t:0.8
on("t:0.8").
holds(say(sp("a"),v,u,u,m,owuro(z(azozo)))) :- on("t:0.8").
fired("t:0.8",say(sp("a"),v,u,u,m,owuro(z(azozo)))) :- on("t:0.8").
% t:0.9
on("t:0.9").
holds(ezuyo(z(alazu))) :- on("t:0.9").
fired("t:0.9",ezuyo(z(alazu))) :- on("t:0.9").
% t:0.10
on("t:0.10").
holds(say(rules,v,u,a,l,owuro(z(azozo)))) :- fits(c("t:0.10"),P), holds(P), on("t:0.10").
fired("t:0.10",say(rules,v,u,a,l,owuro(z(azozo)))) :- fits(c("t:0.10"),P), holds(P), on("t:0.10").
used("t:0.10",say(rules,v,u,a,l,owuro(z(azozo))),P) :- fits(c("t:0.10"),P), holds(P), on("t:0.10").
holds(neg(ezuyo(z(alazu)))) :- fits(P,o("t:0.10")), holds(neg(say(rules,v,u,a,l,P))), on("t:0.10").
fired("t:0.10",neg(ezuyo(z(alazu)))) :- fits(P,o("t:0.10")), holds(neg(say(rules,v,u,a,l,P))), on("t:0.10").
used("t:0.10",neg(ezuyo(z(alazu))),neg(say(rules,v,u,a,l,P))) :- fits(P,o("t:0.10")), holds(neg(say(rules,v,u,a,l,P))), on("t:0.10").
% t:0.11
on("t:0.11").
holds(ezuyo(z(alazu))) :- on("t:0.11").
fired("t:0.11",ezuyo(z(alazu))) :- on("t:0.11").
% t:0.12
on("t:0.12").
holds(isa(azozo,odoze)) :- on("t:0.12").
fired("t:0.12",isa(azozo,odoze)) :- on("t:0.12").
% t:0.13
on("t:0.13").
holds(say(rules,v,u,a,l,owuro(z(X)))) :- holds(isa(X,odoze)), on("t:0.13").
fired("t:0.13",say(rules,v,u,a,l,owuro(z(X)))) :- holds(isa(X,odoze)), on("t:0.13").
used("t:0.13",say(rules,v,u,a,l,owuro(z(X))),isa(X,odoze)) :- holds(isa(X,odoze)), on("t:0.13").
% t:0.14
on("t:0.14").
holds(say(rules,v,u,u,l,owuro(z(X)))) :- holds(isa(X,odoze)), on("t:0.14").
fired("t:0.14",say(rules,v,u,u,l,owuro(z(X)))) :- holds(isa(X,odoze)), on("t:0.14").
used("t:0.14",say(rules,v,u,u,l,owuro(z(X))),isa(X,odoze)) :- holds(isa(X,odoze)), on("t:0.14").
% t:0.15
on("t:0.15").
holds(say(rules,v,u,a,l,owuro(z(every(odoze))))) :- on("t:0.15").
fired("t:0.15",say(rules,v,u,a,l,owuro(z(every(odoze))))) :- on("t:0.15").
holds(say(rules,v,u,a,l,owuro(z(X)))) :- holds(isa(X,odoze)), on("t:0.15").
fired("t:0.15",say(rules,v,u,a,l,owuro(z(X)))) :- holds(isa(X,odoze)), on("t:0.15").
used("t:0.15",say(rules,v,u,a,l,owuro(z(X))),isa(X,odoze)) :- holds(isa(X,odoze)), on("t:0.15").
% t:0.16
on("t:0.16").
holds(say(rules,v,u,u,l,owuro(z(every(odoze))))) :- on("t:0.16").
fired("t:0.16",say(rules,v,u,u,l,owuro(z(every(odoze))))) :- on("t:0.16").
% t:0.17
on("t:0.17").
holds(say(rules,v,u,a,l,owuro(z(ls("t:0.17",z))))) :- on("t:0.17").
fired("t:0.17",say(rules,v,u,a,l,owuro(z(ls("t:0.17",z))))) :- on("t:0.17").
holds(say(rules,v,u,a,l,owuro(z(X)))) :- member(ls("t:0.17",z),X,G), on("t:0.17").
fired("t:0.17",say(rules,v,u,a,l,owuro(z(X)))) :- member(ls("t:0.17",z),X,G), on("t:0.17").
% t:0.18
on("t:0.18").
holds(say(rules,v,u,u,l,owuro(z(ls("t:0.18",z))))) :- on("t:0.18").
fired("t:0.18",say(rules,v,u,u,l,owuro(z(ls("t:0.18",z))))) :- on("t:0.18").
% t:0.19
on("t:0.19").
holds(say(ls("t:0.19",b),b,u,a,r,ezuyo(z(azozo),b(ls("t:0.19",b))))) :- on("t:0.19").
fired("t:0.19",say(ls("t:0.19",b),b,u,a,r,ezuyo(z(azozo),b(ls("t:0.19",b))))) :- on("t:0.19").
holds(say(X,b,u,a,r,ezuyo(z(azozo),b(X)))) :- member(ls("t:0.19",b),X,G), on("t:0.19").
fired("t:0.19",say(X,b,u,a,r,ezuyo(z(azozo),b(X)))) :- member(ls("t:0.19",b),X,G), on("t:0.19").
% t:0.20
on("t:0.20").
holds(say(rules,v,u,a,l,if(ezuyo(z(alazu)),owuro(z(azozo))))) :- on("t:0.20").
fired("t:0.20",say(rules,v,u,a,l,if(ezuyo(z(alazu)),owuro(z(azozo))))) :- on("t:0.20").
% t:0.21
on("t:0.21").
holds(say(rules,v,u,a,l,if(ezuyo(z(alazu)),owuro(z(azozo))))) :- on("t:0.21").
fired("t:0.21",say(rules,v,u,a,l,if(ezuyo(z(alazu)),owuro(z(azozo))))) :- on("t:0.21").
% t:0.22
on("t:0.22").
holds(say(rules,v,u,a,l,may(owuro(z(azozo))))) :- on("t:0.22").
fired("t:0.22",say(rules,v,u,a,l,may(owuro(z(azozo))))) :- on("t:0.22").
% t:0.23
on("t:0.23").
holds(say(rules,v,u,a,l,against(owuro(z(azozo)),plan(sp("a"))))) :- on("t:0.23").
fired("t:0.23",say(rules,v,u,a,l,against(owuro(z(azozo)),plan(sp("a"))))) :- on("t:0.23").
% t:0.24
on("t:0.24").
holds(say(rules,v,u,a,l,because(ezuyo(z(alazu)),owuro(z(azozo))))) :- on("t:0.24").
fired("t:0.24",say(rules,v,u,a,l,because(ezuyo(z(alazu)),owuro(z(azozo))))) :- on("t:0.24").

% Fits, from match().
fits(c("t:0.10"),ezuyo(z(alazu))).
fits(ezuyo(z(alazu)),c("t:0.10")).
fits(o("t:0.10"),owuro(z(azozo))).
fits(owuro(z(azozo)),o("t:0.10")).
fits(owuro(z(ls("t:0.18",z))),owuro(z(ls("t:0.17",z)))).

% Members, from claimMemberLists().
member(ls("t:0.17",z),azozo,1).
member(ls("t:0.17",z),alazu,2).
member(ls("t:0.19",b),ahela,1).
member(ls("t:0.19",b),alazu,2).
