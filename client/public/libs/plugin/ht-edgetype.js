!function(y){"use strict";var e="ht",f=y[e],w=Math,z=w.max,K=w.min,D=w.abs,m=w.atan2,L=(w.cos,w.sin,w.ceil),b=f.Default,S=b.getInternal(),M=f.List,r=S.Mat,P=S.getNodeRect,E=S.intersectionLineRect,B=b.getDistance,A=b.setEdgeType,n="left",U="right",X="top",$="bottom",O="edge.type",Z="edge.gap",d="edge.center",F="edge.extend",G=function(y,j){return P(y,j).width},_=function(g,O){return P(g,O).height},k=function(B,X){return S.getEdgeHostPosition(B,X,"source")},l=function(D,L){return S.getEdgeHostPosition(D,L,"target")},W=function(S,A){var y=S.s(O),U=S.getEdgeGroup();if(U){var w=0;if(U.eachSiblingEdge(function(L){A.isVisible(L)&&L.s(O)==y&&w++}),w>1)return S.s(Z)*(w-1)/2}return 0},J=function(n,B){var U=n.s(O),m=n.isLooped();if(!n.getEdgeGroup())return m?n.s(Z):0;var f,r=0,D=0,d=0;return n.getEdgeGroup().getSiblings().each(function(J){J.each(function(E){if(E._40I===n._40I&&E.s(O)==U&&B.isVisible(E)){var l=E.s(Z);f?(D+=d/2+l/2,d=l):(f=E,d=l),E===n&&(r=D)}})}),m?D-r+d:r-D/2},I=function(a,o){var X=o.s("edge.corner.radius");return b.toRoundedCorner(a,X)};S.addMethod(f.Style,{"edge.ripple.elevation":-20,"edge.ripple.size":1,"edge.ripple.both":!1,"edge.ripple.straight":!1,"edge.ripple.length":-1,"edge.corner.radius":-1,"edge.ortho":.5,"edge.flex":20,"edge.extend":20},!0),A("boundary",function(O,Y,L,n){n||(Y=-Y);var S,v=k(L,O),d=l(L,O),w=P(L,O._40I),t=P(L,O._41I),f=new r(m(d.y-v.y,d.x-v.x)),b=B(v,d),u=v.x,q=v.y;return S=f.tf(0,Y),v={x:S.x+u,y:S.y+q},S=f.tf(b,Y),d={x:S.x+u,y:S.y+q},S=E(v,d,w),S&&(v={x:S[0],y:S[1]}),S=E(v,d,t),S&&(d={x:S[0],y:S[1]}),{points:new M([v,d])}}),A("ripple",function(Y,P,_,j){j||(P=-P);var b=k(_,Y),e=l(_,Y),N=B(b,e),s=K(Y.s("edge.offset"),N/2),z=Y.s("edge.ripple.size"),q=Y.s("edge.ripple.length"),t=Y.s("edge.ripple.both"),A=Y.s(d),F=Y.s("edge.ripple.elevation"),W=new M,p=Y.s("edge.ripple.straight")?null:new M,V=new r(m(e.y-b.y,e.x-b.x));j||(F=-F),N-=2*s,q>0&&(z=L(N/q));var c=N/z;p&&p.add(1);for(var f=0;z>f;f++)p&&p.add(3),0===f?W.add({x:s+c*f,y:A?0:P}):W.add({x:s+c*f,y:P}),W.add({x:s+c*f+c/2,y:F+P}),t&&(F=-F);for(W.add({x:s+N,y:A?0:P}),f=0;f<W.size();f++){var o=V.tf(W.get(f));o.x+=b.x,o.y+=b.y,W.set(f,o)}return{points:W,segments:p}}),A("h.v",function(H,N,r){N=J(H,r);var D=new M,g=H.s(d),Z=k(r,H),o=Z.x,y=Z.y,S=l(r,H),O=S.x,V=S.y,h=H._40I instanceof f.Edge,z=H._41I instanceof f.Edge,p=0,i=0,s=O-o,F=V-y;return g||(p=h?0:G(r,H._40I)/2,i=z?0:_(r,H._41I)/2),s>=0&&0>=F?(D.add({x:o+p,y:y+N}),D.add({x:O+N,y:y+N}),D.add({x:O+N,y:V+i})):0>=s&&F>=0?(D.add({x:o-p,y:y+N}),D.add({x:O+N,y:y+N}),D.add({x:O+N,y:V-i})):s>=0&&F>=0?(D.add({x:o+p,y:y+N}),D.add({x:O-N,y:y+N}),D.add({x:O-N,y:V-i})):(D.add({x:o-p,y:y+N}),D.add({x:O-N,y:y+N}),D.add({x:O-N,y:V+i})),I(D,H)}),A("v.h",function(K,O,q){O=J(K,q);var $=new M,c=K.s(d),h=k(q,K),Z=h.x,x=h.y,A=l(q,K),V=A.x,W=A.y,H=K._40I instanceof f.Edge,D=K._41I instanceof f.Edge,Q=0,F=0,R=V-Z,B=W-x;return c||(Q=D?0:G(q,K._41I)/2,F=H?0:_(q,K._40I)/2),R>=0&&0>=B?($.add({x:Z+O,y:x-F}),$.add({x:Z+O,y:W+O}),$.add({x:V-Q,y:W+O})):0>=R&&B>=0?($.add({x:Z+O,y:x+F}),$.add({x:Z+O,y:W+O}),$.add({x:V+Q,y:W+O})):R>=0&&B>=0?($.add({x:Z-O,y:x+F}),$.add({x:Z-O,y:W+O}),$.add({x:V-Q,y:W+O})):($.add({x:Z-O,y:x-F}),$.add({x:Z-O,y:W+O}),$.add({x:V+Q,y:W+O})),I($,K)}),A("ortho",function(Y,U,F){var p=new M,X=Y.s(d),q=Y.s("edge.ortho"),$=Y._40I,R=Y._41I,y=k(F,Y),o=y.x,N=y.y,V=l(F,Y),e=V.x,r=V.y,a=e-o,J=r-N,t=$ instanceof f.Edge,z=R instanceof f.Edge,u=X||t?0:G(F,$)/2,B=X||t?0:_(F,$)/2,T=X||z?0:G(F,R)/2,O=X||z?0:_(F,R)/2,n=(a-(u+T)*(a>0?1:-1))*q,i=(J-(B+O)*(J>0?1:-1))*q;return D(a)<D(J)?a>=0&&0>=J?(p.add({x:o+U,y:N-B}),p.add({x:o+U,y:N+i+U-B}),p.add({x:e+U,y:N+i+U-B}),p.add({x:e+U,y:r+O})):0>=a&&J>=0?(p.add({x:o+U,y:N+B}),p.add({x:o+U,y:N+i+U+B}),p.add({x:e+U,y:N+i+U+B}),p.add({x:e+U,y:r-O})):a>=0&&J>=0?(p.add({x:o+U,y:N+B}),p.add({x:o+U,y:N+i-U+B}),p.add({x:e+U,y:N+i-U+B}),p.add({x:e+U,y:r-O})):(p.add({x:o+U,y:N-B}),p.add({x:o+U,y:N+i-U-B}),p.add({x:e+U,y:N+i-U-B}),p.add({x:e+U,y:r+O})):a>=0&&0>=J?(p.add({x:o+u,y:N+U}),p.add({x:o+n+U+u,y:N+U}),p.add({x:o+n+U+u,y:r+U}),p.add({x:e-T,y:r+U})):0>=a&&J>=0?(p.add({x:o-u,y:N+U}),p.add({x:o+n+U-u,y:N+U}),p.add({x:o+n+U-u,y:r+U}),p.add({x:e+T,y:r+U})):a>=0&&J>=0?(p.add({x:o+u,y:N+U}),p.add({x:o+n-U+u,y:N+U}),p.add({x:o+n-U+u,y:r+U}),p.add({x:e-T,y:r+U})):(p.add({x:o-u,y:N+U}),p.add({x:o+n-U-u,y:N+U}),p.add({x:o+n-U-u,y:r+U}),p.add({x:e+T,y:r+U})),I(p,Y)}),A("flex",function(X,T,B){var O=new M,E=X.s("edge.flex")+W(X,B),S=X.s(d),x=X._40I,m=X._41I,o=k(B,X),h=o.x,z=o.y,U=l(B,X),j=U.x,H=U.y,A=x instanceof f.Edge,p=m instanceof f.Edge,c=j-h,L=H-z,b=S||A?0:G(B,x)/2,q=S||A?0:_(B,x)/2,V=S||p?0:G(B,m)/2,r=S||p?0:_(B,m)/2,t=c>0?E:-E,Y=L>0?E:-E;return D(c)<D(L)?c>=0&&0>=L?(O.add({x:h+T,y:z-q}),O.add({x:h+T,y:z+Y+T-q}),O.add({x:j+T,y:H-Y+T+r}),O.add({x:j+T,y:H+r})):0>=c&&L>=0?(O.add({x:h+T,y:z+q}),O.add({x:h+T,y:z+Y+T+q}),O.add({x:j+T,y:H-Y+T-r}),O.add({x:j+T,y:H-r})):c>=0&&L>=0?(O.add({x:h+T,y:z+q}),O.add({x:h+T,y:z+Y-T+q}),O.add({x:j+T,y:H-Y-T-r}),O.add({x:j+T,y:H-r})):(O.add({x:h+T,y:z-q}),O.add({x:h+T,y:z+Y-T-q}),O.add({x:j+T,y:H-Y-T+r}),O.add({x:j+T,y:H+r})):c>=0&&0>=L?(O.add({x:h+b,y:z+T}),O.add({x:h+t+T+b,y:z+T}),O.add({x:j-t+T-V,y:H+T}),O.add({x:j-V,y:H+T})):0>=c&&L>=0?(O.add({x:h-b,y:z+T}),O.add({x:h+t+T-b,y:z+T}),O.add({x:j-t+T+V,y:H+T}),O.add({x:j+V,y:H+T})):c>=0&&L>=0?(O.add({x:h+b,y:z+T}),O.add({x:h+t-T+b,y:z+T}),O.add({x:j-t-T-V,y:H+T}),O.add({x:j-V,y:H+T})):(O.add({x:h-b,y:z+T}),O.add({x:h+t-T-b,y:z+T}),O.add({x:j-t-T+V,y:H+T}),O.add({x:j+V,y:H+T})),I(O,X)}),A("extend.east",function(_,c,C){var B=new M,X=_.s(F)+W(_,C),m=_.s(d),Q=k(C,_),V=_._40I instanceof f.Edge,o=_._41I instanceof f.Edge,T=Q.x+(m||V?0:G(C,_._40I)/2),y=Q.y,x=l(C,_),v=x.x+(m||o?0:G(C,_._41I)/2),R=x.y,Z=z(T,v)+X;return y>R?(B.add({x:T,y:y+c}),B.add({x:Z+c,y:y+c}),B.add({x:Z+c,y:R-c}),B.add({x:v,y:R-c})):(B.add({x:T,y:y-c}),B.add({x:Z+c,y:y-c}),B.add({x:Z+c,y:R+c}),B.add({x:v,y:R+c})),I(B,_)}),A("extend.west",function(C,y,H){var Z=new M,U=C.s(F)+W(C,H),i=C.s(d),c=C._40I instanceof f.Edge,T=C._41I instanceof f.Edge,o=k(H,C),$=o.x-(i||c?0:G(H,C._40I)/2),u=o.y,Y=l(H,C),A=Y.x-(i||T?0:G(H,C._41I)/2),v=Y.y,b=K($,A)-U;return u>v?(Z.add({x:$,y:u+y}),Z.add({x:b-y,y:u+y}),Z.add({x:b-y,y:v-y}),Z.add({x:A,y:v-y})):(Z.add({x:$,y:u-y}),Z.add({x:b-y,y:u-y}),Z.add({x:b-y,y:v+y}),Z.add({x:A,y:v+y})),I(Z,C)}),A("extend.north",function(R,o,Y){var b=new M,r=R.s(F)+W(R,Y),O=R.s(d),D=R._40I instanceof f.Edge,L=R._41I instanceof f.Edge,A=k(Y,R),m=A.x,e=A.y-(O||D?0:_(Y,R._40I)/2),N=l(Y,R),J=N.x,E=N.y-(O||L?0:_(Y,R._41I)/2),h=K(e,E)-r;return m>J?(b.add({y:e,x:m+o}),b.add({y:h-o,x:m+o}),b.add({y:h-o,x:J-o}),b.add({y:E,x:J-o})):(b.add({y:e,x:m-o}),b.add({y:h-o,x:m-o}),b.add({y:h-o,x:J+o}),b.add({y:E,x:J+o})),I(b,R)}),A("extend.south",function(t,c,D){var j=new M,V=t.s(F)+W(t,D),T=t.s(d),o=t._40I instanceof f.Edge,O=t._41I instanceof f.Edge,K=k(D,t),R=K.x,L=K.y+(T||o?0:_(D,t._40I)/2),s=l(D,t),E=s.x,A=s.y+(T||O?0:_(D,t._41I)/2),v=z(L,A)+V;return R>E?(j.add({y:L,x:R+c}),j.add({y:v+c,x:R+c}),j.add({y:v+c,x:E-c}),j.add({y:A,x:E-c})):(j.add({y:L,x:R-c}),j.add({y:v+c,x:R-c}),j.add({y:v+c,x:E+c}),j.add({y:A,x:E+c})),I(j,t)});var o=function(i,G,T,x,N){if(x.sort(function(O,X){var y=O.getSourceAgent()===G?O.getTargetAgent():O.getSourceAgent(),A=X.getSourceAgent()===G?X.getTargetAgent():X.getSourceAgent(),p=y.p(),N=A.p();if(T===n||T===U){if(p.y>N.y)return 1;if(p.y<N.y)return-1}else{if(p.x>N.x)return 1;if(p.x<N.x)return-1}return b.sortFunc(O.getId(),X.getId())}),N){for(var I,J,l,g=i.getSourceAgent(),K=i.getTargetAgent(),m=0;m<x.size();m++){var $=x.get(m);$.getSourceAgent()===g&&$.getTargetAgent()===K||$.getTargetAgent()===g&&$.getSourceAgent()===K?(J||(J=new M),J.add($,0)):J?(l||(l=new M),l.add($)):(I||(I=new M),I.add($))}x.clear(),I&&x.addAll(I),J&&x.addAll(J),l&&x.addAll(l)}var W=x.indexOf(i),C=x.size(),Y=i.s(Z);return{side:T,index:W,size:C,offset:-Y*(C-1)/2+Y*W}},c=function(S,A,x,d,G){var B=A.s(O);return o(A,x,d,x.getAgentEdges().toList(function(h){return S.isVisible(h)&&h.s(O)===B}),G)},u=function(N,m){var R=N.getSourceAgent()===m?N.getTargetAgent():N.getSourceAgent(),T=m.p(),h=R.p(),P=h.x-T.x,K=h.y-T.y;return P>0&&D(K)<=P?U:0>P&&D(K)<=-P?n:K>0&&D(P)<=K?$:X},Q=function(Z,p,R){var I=p.s(O),Y=u(p,R);return o(p,R,Y,R.getAgentEdges().toList(function(n){return Z.isVisible(n)&&n.s(O)===I&&u(n,R)===Y}))},q=function(i,y){var q=i.getSourceAgent()===y,E=q?i.getTargetAgent():i.getSourceAgent(),L=y.p(),A=E.p();return q?L.y>A.y?X:$:L.x<A.x?U:n},v=function(p,u,H){var v=u.s(O),x=q(u,H);return o(u,H,x,H.getAgentEdges().toList(function(Y){return p.isVisible(Y)&&Y.s(O)===v&&q(Y,H)===x}),x===U||x===$)},C=function(V,K){var k=V.getSourceAgent()===K,m=k?V.getTargetAgent():V.getSourceAgent(),Y=K.p(),v=m.p();return k?Y.x<v.x?U:n:Y.y>v.y?X:$},R=function(B,D,P){var h=D.s(O),Z=C(D,P);return o(D,P,Z,P.getAgentEdges().toList(function(X){return B.isVisible(X)&&X.s(O)===h&&C(X,P)===Z}),Z===U||Z===$)},x=function(V,B,x){var r=V.getSourceAgent(),s=V.getTargetAgent(),t=r.getId()>s.getId(),l=t?s:r,h=t?r:s,w=l.p(),u=h.p(),E=x(B,V,l),Y=x(B,V,h),Z=V.s(d),b=Z?0:G(B,l)/2,g=Z?0:G(B,h)/2,m=Z?0:_(B,l)/2,H=Z?0:_(B,h)/2,a=E.offset,v=Y.offset,R=E.side,J=Y.side,q=new M;return R===X?(q.add({x:w.x+a,y:w.y-m}),q.add({x:w.x+a,y:u.y+v}),J===n?q.add({x:u.x-g,y:u.y+v}):q.add({x:u.x+g,y:u.y+v})):R===$?(q.add({x:w.x+a,y:w.y+m}),q.add({x:w.x+a,y:u.y+v}),J===n?q.add({x:u.x-g,y:u.y+v}):q.add({x:u.x+g,y:u.y+v})):R===n?(q.add({x:w.x-b,y:w.y+a}),q.add({x:u.x+v,y:w.y+a}),J===$?q.add({x:u.x+v,y:u.y+H}):q.add({x:u.x+v,y:u.y-H})):R===U&&(q.add({x:w.x+b,y:w.y+a}),q.add({x:u.x+v,y:w.y+a}),J===$?q.add({x:u.x+v,y:u.y+H}):q.add({x:u.x+v,y:u.y-H})),t&&q.reverse(),I(q,V)};A("ortho2",function(T,t,B){var w,P,H=T.s(d),b=T.s("edge.ortho"),D=T.getSourceAgent(),Y=T.getTargetAgent(),e=D.getId()>Y.getId(),s=e?Y:D,o=e?D:Y,S=s.p(),F=o.p(),f=Q(B,T,s),l=Q(B,T,o),k=H?0:G(B,s)/2,y=H?0:_(B,s)/2,u=H?0:G(B,o)/2,V=H?0:_(B,o)/2,z=new M,N=f.offset,h=l.offset,m=f.side;return m===U?(w=F.y>S.y?-N:N,P=S.x+k+(F.x-u-S.x-k)*b,z.add({x:S.x+k,y:S.y+N}),z.add({x:P+w,y:S.y+N}),z.add({x:P+w,y:F.y+h}),z.add({x:F.x-u,y:F.y+h})):m===n?(w=F.y>S.y?-N:N,P=S.x-k-(S.x-k-F.x-u)*b,z.add({x:S.x-k,y:S.y+N}),z.add({x:P-w,y:S.y+N}),z.add({x:P-w,y:F.y+h}),z.add({x:F.x+u,y:F.y+h})):m===$?(w=F.x>S.x?-N:N,P=S.y+y+(F.y-V-S.y-y)*b,z.add({x:S.x+N,y:S.y+y}),z.add({x:S.x+N,y:P+w}),z.add({x:F.x+h,y:P+w}),z.add({x:F.x+h,y:F.y-V})):m===X&&(w=F.x>S.x?-N:N,P=S.y-y-(S.y-y-F.y-V)*b,z.add({x:S.x+N,y:S.y-y}),z.add({x:S.x+N,y:P-w}),z.add({x:F.x+h,y:P-w}),z.add({x:F.x+h,y:F.y+V})),e&&z.reverse(),I(z,T)},!0),A("flex2",function(y,o,t){var e,g=y.getSourceAgent(),u=y.getTargetAgent(),J=g.getId()>u.getId(),a=J?u:g,L=J?g:u,S=a.p(),A=L.p(),F=Q(t,y,a),D=Q(t,y,L),E=y.s(d),c=y.s("edge.flex")+(F.size-1)/2*y.s(Z),W=E?0:G(t,a)/2,p=E?0:_(t,a)/2,x=E?0:G(t,L)/2,b=E?0:_(t,L)/2,r=new M,H=F.offset,q=D.offset,P=F.side;return P===U?(e=A.y>S.y?-H:H,r.add({x:S.x+W,y:S.y+H}),r.add({x:S.x+W+c+e,y:S.y+H}),r.add({x:A.x-x-c+e,y:A.y+q}),r.add({x:A.x-x,y:A.y+q})):P===n?(e=A.y>S.y?-H:H,r.add({x:S.x-W,y:S.y+H}),r.add({x:S.x-W-c-e,y:S.y+H}),r.add({x:A.x+x+c-e,y:A.y+q}),r.add({x:A.x+x,y:A.y+q})):P===$?(e=A.x>S.x?-H:H,r.add({x:S.x+H,y:S.y+p}),r.add({x:S.x+H,y:S.y+p+c+e}),r.add({x:A.x+q,y:A.y-b-c+e}),r.add({x:A.x+q,y:A.y-b})):P===X&&(e=A.x>S.x?-H:H,r.add({x:S.x+H,y:S.y-p}),r.add({x:S.x+H,y:S.y-p-c-e}),r.add({x:A.x+q,y:A.y+b+c-e}),r.add({x:A.x+q,y:A.y+b})),J&&r.reverse(),I(r,y)},!0),A("extend.north2",function(x,C,b){var g=x.getSourceAgent(),P=x.getTargetAgent(),e=g.getId()>P.getId(),i=e?P:g,s=e?g:P,U=i.p(),h=s.p(),W=c(b,x,i,X),y=c(b,x,s,X,!0),A=x.s(d),E=A?0:_(b,i)/2,N=A?0:_(b,s)/2,f=W.offset,R=y.offset,H=x.s(F)+(W.size-1)/2*x.s(Z),n=K(U.y-E,h.y-N)-H+(U.x<h.x?f:-f),D=new M;return D.add({x:U.x+f,y:U.y-E}),D.add({x:U.x+f,y:n}),D.add({x:h.x+R,y:n}),D.add({x:h.x+R,y:h.y-N}),e&&D.reverse(),I(D,x)},!0),A("extend.south2",function(n,E,o){var U=n.getSourceAgent(),l=n.getTargetAgent(),k=U.getId()>l.getId(),s=k?l:U,N=k?U:l,H=s.p(),S=N.p(),A=c(o,n,s,$),K=c(o,n,N,$,!0),C=n.s(d),r=C?0:_(o,s)/2,t=C?0:_(o,N)/2,v=A.offset,Q=K.offset,h=n.s(F)+(A.size-1)/2*n.s(Z),e=z(H.y+r,S.y+t)+h+(H.x>S.x?v:-v),R=new M;return R.add({x:H.x+v,y:H.y+r}),R.add({x:H.x+v,y:e}),R.add({x:S.x+Q,y:e}),R.add({x:S.x+Q,y:S.y+t}),k&&R.reverse(),I(R,n)},!0),A("extend.west2",function(t,s,y){var B=t.getSourceAgent(),h=t.getTargetAgent(),_=B.getId()>h.getId(),n=_?h:B,D=_?B:h,J=n.p(),A=D.p(),C=c(y,t,n,X),r=c(y,t,D,X,!0),N=t.s(d),p=N?0:G(y,n)/2,U=N?0:G(y,D)/2,o=C.offset,z=r.offset,H=t.s(F)+(C.size-1)/2*t.s(Z),W=K(J.x-p,A.x-U)-H+(J.y<A.y?o:-o),w=new M;return w.add({x:J.x-p,y:J.y+o}),w.add({x:W,y:J.y+o}),w.add({x:W,y:A.y+z}),w.add({x:A.x-U,y:A.y+z}),_&&w.reverse(),I(w,t)},!0),A("extend.east2",function(g,q,V){var r=g.getSourceAgent(),s=g.getTargetAgent(),p=r.getId()>s.getId(),e=p?s:r,H=p?r:s,P=e.p(),L=H.p(),u=c(V,g,e,X),h=c(V,g,H,X,!0),R=g.s(d),m=R?0:G(V,e)/2,l=R?0:G(V,H)/2,t=u.offset,$=h.offset,Y=g.s(F)+(u.size-1)/2*g.s(Z),E=z(P.x+m,L.x+l)+Y+(P.y>L.y?t:-t),b=new M;return b.add({x:P.x+m,y:P.y+t}),b.add({x:E,y:P.y+t}),b.add({x:E,y:L.y+$}),b.add({x:L.x+l,y:L.y+$}),p&&b.reverse(),I(b,g)},!0),A("v.h2",function(D,P,Y){return x(D,Y,v)},!0),A("h.v2",function(P,_,b){return x(P,b,R)},!0)}("undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:(0,eval)("this"),Object);