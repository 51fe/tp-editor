!function(h,_){"use strict";var u="ht",k=h[u],O="position",Y="absolute",Q="px",B="left",U="top",Z="innerHTML",S="className",V="width",F="height",w="0",j="display",N="none",y="visibility",T="user-select",D="margin",b="padding",d=null,e=k.Color,t=k.Default,s=t.getInternal(),o=h.setTimeout,a=h.setInterval,g=h.clearTimeout,H=h.clearInterval,E=h.parseInt,J=t.isLeftButton,l=t.isDragging,A=t.startDragging,z=t.getDistance,n=t.isTouchable,I=t.isTouchEvent,M=t.getPagePoint,i=t.isRightButton,W=e.widgetIconHighlight,r=e.widgetIconBorder,X=e.widgetIconGradient,p=function(){return document},x=function(h,O){return h.querySelectorAll(O)},v=function(Y){var v=p().createElement(Y);return"ul"===Y&&(c(v,O,"relative"),c(v,D,w),c(v,b,w),c(v,"list-style",N),c(v,"box-sizing","border-box"),c(v,"-moz-box-sizing","border-box"),c(v,j,"inline-block"),c(v,"vertical-align","text-bottom"),c(v,"border","1px solid "+t.contextMenuBorderColor),c(v,"box-shadow","0 0 16px 1px "+t.contextMenuShadowColor),c(v,"overflow","hidden"),t.contextMenuBorderRadius&&c(v,"border-radius",t.contextMenuBorderRadius+Q)),v},m=function(O){var N=O.touches[0];return N?N:O.changedTouches[0]},G=function(){return v("div")},L=function(){return v("canvas")},c=function(k,W,P){k.style.setProperty(W,P,d)},P=function(z,J,g){t.def(k.widget[z],J,g)},C=function(M,d){M.appendChild(d)},R=function(e,g){e.removeChild(g)},K=s.addEventListener,$=s.removeEventListener;s.addMethod(t,{contextMenuCheckIcon:{width:16,height:16,comps:[{type:"border",rect:[1,1,14,14],width:1,color:r},{type:"shape",points:[13,3,7,12,4,8],borderWidth:2,borderColor:W}]},contextMenuRadioIcon:{width:16,height:16,comps:[{type:"circle",rect:[2,2,12,12],borderWidth:1,borderColor:r},{type:"circle",rect:[4,4,8,8],borderWidth:1,borderColor:W,gradient:t.imageGradient,gradientColor:X,background:W}]},contextMenuLabelFont:(n?"16":"13")+"px arial, sans-serif",contextMenuLabelColor:"#000",contextMenuBackground:"#fff",contextMenuDisabledLabelColor:"#888",contextMenuHoverBackground:"#648BFE",contextMenuHoverLabelColor:"#fff",contextMenuSeparatorWidth:1,contextMenuSeparatorColor:"#E5E5E5",contextMenuScrollerColor1:"#FDFDFD",contextMenuScrollerColor2:"#D3D3D3",contextMenuScrollerBorderColor:"#C3C3C3",contextMenuBorderColor:"#C3C3C3",contextMenuShadowColor:"rgba(128, 128, 128, 0.5)",contextMenuBorderRadius:5,contextMenuSubmenuMark:"▶"},!0);var q=function(X){var m=this,S=X._view;m.$11b=X,m.addListeners(),K(S,"contextmenu",function(Z){Z.preventDefault()});var y=m.$37b=m.$36b.bind(m);K(S,"mouseover",y),K(S,"mouseout",y)};t.def(q,_,{ms_listener:1,getView:function(){return this.$11b._view},handle_touchstart:function(q){if(t.preventDefault(q),J(q)){for(var e=this,p=e.$11b,s=e.getView(),E=s.children,Z=0;Z<E.length;Z++){var k=E[Z],d=k.$24b,Q=k.$25b;if(d&&d.contains(q.target))return p.scrollUp(k),e.$28b=o(function(){e.$29b=a(function(){p.scrollUp(k)},100)},500),A(e,q),void 0;if(Q&&Q.contains(q.target))return p.scrollDown(k),e.$28b=o(function(){e.$29b=a(function(){p.scrollDown(k)},100)},500),A(e,q),void 0}e.$30b=M(q)}},handle_mousedown:function(Z){this.handle_touchstart(Z)},handle_touchend:function(C){if(J(C)){var v=this,n=v.$30b,M=I(C)?{x:m(C).pageX,y:m(C).pageY}:{x:C.pageX,y:C.pageY};if(!n||z(n,M)>1)return delete v.$30b,void 0;for(var k=v.getView(),w=v.$11b,g=C.target,r=d,j=d,O=w._items,H=k.$26b,W=0;W<H.length;W++)if(j=H[W],j.contains(g)){r=j.getAttribute("data-id");break}if(r&&O){var s=w.$17b(O,function(h){return h._id===r});if(s){var R=!1;s.disabled instanceof Function?R=s.disabled.call(w,s):s.disabled===!0&&(R=!0),R||(s.items?I(C)&&v.$36b(j,!0):w.$1b(s,C))}}delete v.$30b}},$36b:function(I,D){if(!l()){var $,n=this,H=n.$11b,R=n.getView(),e=H.$20b||R.children[0],s=H.$19b,g=R.$26b,E=R.children,j=I.target,b=R.getBoundingClientRect(),G=t.getWindowInfo(),p=G.width,V=G.height,J=function(T){for(var U=0;U<E.length;U++){var a=E[U],d=new RegExp(T+"$"),R=a[S];if(R&&(d.test(R)||R.indexOf(T+" ")>=0))return a}},m=function(w){for(var Y=0;Y<g.length;Y++){var W=g[Y],m=new RegExp(w+"$"),r=W[S];if(r&&(m.test(r)||r.indexOf(w+" ")>=0))return W}},K=function(u){var k=m("menu-item"+u.$45b),t=k.getBoundingClientRect(),Z=t.top-b.top,X=t.left-b.left;c(u,U,Z+Q),c(u,B,X+t.width+Q);var n=u.getBoundingClientRect(),z=n.top,i=n.left,I=n.height,h=n.width,j=z+I+2,_=i+h+2;j>V&&c(u,U,Z+V-j+Q),_>p&&c(u,B,X-h+Q)};if(D)$=I;else{if("mouseover"===I.type){for(var h=0;h<g.length;h++){var r=g[h];if(r.contains(j)){$=r;break}}if(!$&&s){var F=s.parentNode,f=J("submenu"+s.getAttribute("data-id"));(f&&f.contains(j)||F&&F.contains(j))&&($=s)}}else if("mouseout"===I.type){for(var W=!1,P=I.relatedTarget,h=0;h<E.length;h++){var a=E[h];if("hidden"!==a.style.visibility&&a.contains(P)){W=!0;break}}if(W)return}!$&&e&&($=m("menu-item"+(e.$45b||"NaN")))}if($!=s){if(s)for(var z=s;z;){if(z[S]=z[S].replace(" menu-item-hover",""),z[S].indexOf("disabled")<0){var Z=H.getItemByProperty("_id",z.getAttribute("data-id"));null!=Z.background?Z.background instanceof Function?c(z,"background-color",Z.background.call(H,Z)):c(z,"background-color",Z.background):c(z,"background-color",t.contextMenuBackground),c(z,"color",t.contextMenuLabelColor)}var O=J("submenu"+z.getAttribute("data-id"));O&&c(O,y,"hidden");var v=z.parentNode;z=m("menu-item"+(v.$45b||"NaN"))}if($){for(var X=$,Y=[];X;){X[S]+=" menu-item-hover",X[S].indexOf("disabled")<0&&(c(X,"background-color",t.contextMenuHoverBackground),c(X,"color",t.contextMenuHoverLabelColor));var k=J("submenu"+X.getAttribute("data-id"));k&&(c(k,y,"visible"),Y.push(k));var v=X.parentNode;X=m("menu-item"+(v.$45b||"NaN"))}Y.reverse(),Y.forEach(function(k){K(k)})}}H.$19b=$,H.$20b=$?$.parentNode:R.children[0]}},handle_mouseup:function(n){this.handle_touchend(n)},handleWindowTouchEnd:function(){var S=this;S.$28b!=d&&(g(S.$28b),delete S.$28b),S.$29b!=d&&(H(S.$29b),delete S.$29b),delete S.$34b,delete S.$30b,delete S.$35b},handleWindowMouseUp:function(o){this.handleWindowTouchEnd(o)},handle_mousemove:function(v){this.handle_touchmove(v)},handle_touchmove:function(o){if(!l()&&J(o)){for(var X=this,Q=X.getView().children,t=d,u=0;u<Q.length;u++){var P=Q[u];if(P.contains(o.target)){t=P;break}}var E=X.$30b,U=I(o)?{x:m(o).pageX,y:m(o).pageY}:{x:o.pageX,y:o.pageY};t&&E&&z(E,U)>2&&(A(X,o),X.$34b=t,X.$35b=t.$18b)}},handleWindowTouchMove:function(F){F.preventDefault();var U=this,u=U.$11b,o=U.$34b,t=U.$35b,c=U.$30b;if(c&&o){var J=I(F)?{x:m(F).pageX,y:m(F).pageY}:{x:F.pageX,y:F.pageY},M=J.y-c.y;M>0?u.scrollUp(o,o.$18b-(t-M)):u.scrollDown(o,t-M-o.$18b)}},handleWindowMouseMove:function(A){this.handleWindowTouchMove(A)},$10b:function(J,s){J.preventDefault();for(var X=this,W=X.getView().children,R=d,g=0;g<W.length;g++){var p=W[g];if(p.contains(J.target)){R=p;break}}if(R){var V=this.$11b,S=V.getRowHeight();Math.abs(s)>.05&&(s>0?V.scrollUp(R,s*S):0>s&&V.scrollDown(R,-s*S))}},handle_mousewheel:function(b){this.$10b(b,b.wheelDelta/40)},handle_DOMMouseScroll:function(B){this.$10b(B,-B.detail)},$44b:function(Y){this.getView().contains(Y.target)||this.$11b.hide()},$41b:function(L){t.preventDefault(L)},$4b:function(a,C){var Z=this.$11b;if(C=C||Z._items,C&&C.length&&a.keyCode){var W=[a.keyCode];a.shiftKey&&W.push(16),a.ctrlKey&&W.push(17),a.altKey&&W.push(18),/mac/.test(h.navigator?h.navigator.userAgent.toLowerCase():"")?a.metaKey&&W.push(17):a.metaKey&&W.push(91),W.sort();var A=W.join(),s=Z.$17b(C,function(O){if(O.key){var E=O.key.slice(0);return E.sort(),A===E.join()}});if(s){s.preventDefault!==!1&&a.preventDefault();var P=!1;s.disabled instanceof Function?P=s.disabled.call(Z,s):s.disabled===!0&&(P=!0),P||Z.$1b(s,a)}}},$39b:function(l){this.$32b=M(l)},$38b:function(a){if(t.preventDefault(a),!J(a)){var R=this;R._showContextMenu=i(a),R._showContextMenu||(R.$31b=M(a),R.$33b=o(function(){R._showContextMenu=!0,delete R.$33b},600))}},$40b:function(Q){var b=this;b._showContextMenu&&(i(Q)?b.$11b.show(Q):b.$31b&&(b.$32b?z(b.$31b,b.$32b)<10&&b.$11b.show(Q):b.$11b.show(Q))),b.$33b!=d&&(g(b.$33b),delete b.$33b),delete b.$31b,delete b.$32b}}),k.widget.ContextMenu=function(w){var b=this,J=b._view=s.createView(null,b);J[S]="ht-widget-contextmenu",b.setItems(w),b.$13b=new q(b),c(J,"font",t.contextMenuLabelFont),c(J,O,Y),c(J,"cursor","default"),c(J,"-webkit-"+T,N),c(J,"-moz-"+T,N),c(J,"-ms-"+T,N),c(J,T,N),c(J,"box-sizing","border-box"),c(J,"-moz-box-sizing","border-box"),t.baseZIndex!=d&&c(J,"z-index",E(t.baseZIndex)+2+""),b.$3b=function(u){b.$13b.$4b(u)}},P("ContextMenu",_,{$16b:d,$5b:0,_items:d,$21b:d,_enableGlobalKey:!1,ms_v:1,enableGlobalKey:function(){var V=this,d=V._enableGlobalKey;d===!1&&(K(p(),"keydown",V.$3b),V._enableGlobalKey=!0)},disableGlobalKey:function(){this._enableGlobalKey=!1,$(p(),"keydown",this.$3b)},setItems:function(u){this._items=u},getItems:function(){return this._items},getVisibleFunc:function(){return this.$16b},setVisibleFunc:function(s){this.$16b=s},setLabelMaxWidth:function(V){this.$43b=V},$1b:function(R,e){var s=this;if("check"===R.type)R.selected=!R.selected;else if("radio"===R.type){var N=R.groupId;s.$17b(s._items,function(Y){Y.groupId===N&&(Y.selected=!1)}),R.selected=!0}if(s.hide(),R.action)R.action.apply(R.scope||s,[R,e]);else if(R.href){var y=R.linkTarget||"_self";h.open(R.href,y)}},getItemById:function(F){return this.getItemByProperty("id",F)},setItemVisible:function(A,Q){var x=this.getItemById(A);x&&(x.visible=Q)},getItemByProperty:function(D,t,i){var y=this;if(i=i||y._items,!i||0===i.length)return d;var I=y.$17b(i,function(r){return r[D]===t});return I||d},scrollUp:function(L,X){var t=this;if(X=X==d?20:X,X=E(X),0!==X){var O=0;L.$18b>X&&(O=L.$18b-X),t.$42b(L,O),L.scrollTop=O,L.$18b=O}},scrollDown:function(s,A){var t=this;if(A=A==d?20:A,A=E(A),0!==A){var c=s.$22b,v=s.$23b,V=c-v;v+s.$18b+A<c&&(V=s.$18b+A),t.$42b(s,V),s.scrollTop=V,s.$18b=V}},$42b:function(u,F){F=F==d?u.$18b:F;var h=u.$24b,B=u.$25b;h&&(c(h,"top",F+Q),0==F?c(h,j,N):c(h,j,"block")),B&&(c(B,"bottom",-F+Q),F==u.$22b-u.$23b?c(B,j,N):c(B,j,"block"))},getRowHeight:function(){return this._view.querySelector(".menu-item").offsetHeight},$17b:function(V,D){for(var X=0;X<V.length;X++){var l=V[X];if(D(l))return l;if(l.items){var O=this.$17b(l.items,D);if(O)return O}}},$2b:function(W,X){for(var $=this,T=0;T<W.length;T++){$.$5b++;var I=W[T];if(I.visible!==!1)if(t.isFunction(I.visible)&&I.visible()===!1)this._clearItemId(I);else if(!$.$16b||$.$16b.call($,I)){var f=v("li"),d=$.$5b+"";if(c(f,"white-space","nowrap"),c(f,j,"block"),"separator"===I||I.separator===!0){var H=G();H[S]="separator",c(H,F,t.contextMenuSeparatorWidth+Q),c(H,"background",t.contextMenuSeparatorColor),C(f,H)}else{I._id=d,f.setAttribute("data-id",d);var h=v("span"),R=v("span"),J=L(),a=G();if(c(h,j,"inline-block"),c(h,F,"1.2em"),c(R,j,"inline-block"),c(R,F,"1.2em"),c(R,"line-height","1.2em"),J[S]="prefix",c(J,j,"inline-block"),c(J,V,"1em"),c(J,F,"1em"),c(J,"vertical-align","middle"),c(J,D,"0 0.2em"),"check"===I.type&&I.selected?J[S]+=" check-prefix":"radio"===I.type&&I.selected&&(J[S]+=" radio-prefix"),C(f,J),I.icon){var i=L();i[S]="contextmenu-item-icon",c(i,j,"inline-block"),c(i,F,"1.2em"),c(i,V,"1.2em"),c(i,"margin-right","0.2em"),c(i,"float","left"),i.$50b=I.icon,i._item=I,C(h,i)}if(R[Z]=I.label,C(h,R),C(f,h),a[S]="suffix",c(a,j,"inline-block"),c(a,"margin-left","1em"),c(a,"margin-right","0.4em"),c(a,"text-align","right"),c(a,"font-size","75%"),I.items&&(a[Z]=t.contextMenuSubmenuMark),I.suffix&&(a[Z]=I.suffix),C(f,a),f[S]="menu-item menu-item"+d,null!=I.background?I.background instanceof Function?c(f,"background-color",I.background.call($,I)):c(f,"background-color",I.background):c(f,"background-color",t.contextMenuBackground),c(f,"color",t.contextMenuLabelColor),c(f,b,"3px 0"),I.disabled instanceof Function){var B=I.disabled.call($,I);B&&(f[S]+=" disabled",c(f,"color",t.contextMenuDisabledLabelColor))}else I.disabled&&(f[S]+=" disabled",c(f,"color",t.contextMenuDisabledLabelColor));if(I.items){$.$21b||($.$21b=new k.List);var e=v("ul");e[S]="submenu"+d,e.$45b=d,c(e,y,"hidden"),c(e,O,Y),C($._view,e),$.$21b.add(e),$.$2b(I.items,e)}}C(X,f)}else this._clearItemId(I);else this._clearItemId(I)}},rebuild:function(){var e=this,X=e._items,T=e._view;if(T&&(T[Z]="",e.$21b=d,e.$5b=0,e.$19b=d,e.$20b=d,T.$26b=d,X&&0!==X.length)){var J=v("ul",e._r);C(T,J),e.$2b(X,J)}},addTo:function(G){if(G){var m=this,$=m.$13b;m.$12b=G,m.$9b=function(R){$.$44b(R)};var b=m.$6b=function(f){$.$38b(f)},w=m.$7b=function(A){$.$39b(A)},E=m.$8b=function(z){$.$40b(z)};t.mockTouch&&(K(G,"touchstart",b,!0),K(G,"touchmove",w),K(G,"touchend",E)),K(G,"mousedown",b,!0),K(G,"mousemove",w),K(G,"mouseup",E),m.$27b=function(f){$.$41b(f)},K(G,"contextmenu",m.$27b)}},showOnView:function(O,g,q){O=O.getView?O.getView():O;var b=t.getWindowInfo(),v=O.getBoundingClientRect();this.show(v.left+b.left+g,v.top+b.top+q)},show:function(a,s,J){var e=this,J=J==d?!0:!1,y=e._view;if(y){if(e.invalidate(),1===arguments.length){var H=a;if(I(H)){var v=m(H);a=v.pageX,s=v.pageY}else a=H.pageX,s=H.pageY}var z=t.getWindowInfo(),o=z.width,X=z.height,M=z.left,l=z.top,u={pageX:a,pageY:s,clientX:a-M,clientY:s-l,target:1,originEvent:H},i=u.clientX,P=u.clientY,n=function(f){f.style.height=X-6+Q;var m=G(),o=G(),n=function(A){c(A,O,Y),c(A,"text-align","center"),c(A,V,"100%"),c(A,"font-size",10+Q),c(A,"padding","2px 0"),c(A,"border","0px solid "+t.contextMenuScrollerBorderColor),c(A,"background-color",t.contextMenuScrollerColor1),A.style.backgroundImage="-webkit-linear-gradient(top, "+t.contextMenuScrollerColor1+", "+t.contextMenuScrollerColor2+")",A.style.backgroundImage="linear-gradient(to bottom, "+t.contextMenuScrollerColor1+", "+t.contextMenuScrollerColor2+")"};m[S]="menu-arrow-item menu-arrow-item-top",o[S]="menu-arrow-item menu-arrow-item-bottom",n(m),c(m,"top",w),c(m,"left",w),c(m,"border-bottom-width",1+Q),m[Z]="▲",n(o),c(o,"bottom",w),c(o,"left",w),c(o,"border-top-width",1+Q),o[Z]="▼",f.$24b=m,f.$25b=o,f.$18b=f.scrollTop,f.$22b=f.scrollHeight,f.$23b=f.clientHeight,C(f,m),C(f,o),e.$42b(f)};e.beforeShow&&e.beforeShow(u);var W=e._items;if(W&&(H&&H.preventDefault(),W.length)){e.rebuild();var $=y.$26b=x(y,".menu-item");if($.length){t.appendToScreen(y);var f=y.children[0];f.offsetHeight>X&&n(f);var L=P+(J?1:0),q=i+(J?1:0),D=function(T){for(var i=0,S=0,I=0,p=e.$43b;I<T.children.length;I++){var u=T.children[I];if(u.getAttribute("data-id")){var f=u.children[1],M=u.children[2],O=f.children;if(p){var n=O[0];O.length>1&&(n=O[1]),n.offsetWidth>p&&(n[Z]="<marquee scrollamount='3'>"+n[Z]+"</marquee>",n.children[0].style.verticalAlign="text-bottom",c(n,V,p+Q),c(n,j,"inline-block"))}var R=f.offsetWidth,l=M.offsetWidth;R>i&&(i=R),l>S&&(S=l)}}for(I=0;I<T.children.length;I++){var u=T.children[I];if(u.getAttribute("data-id")){var f=u.children[1],M=u.children[2],$=f.children[0],o=f.children[1];!o&&$.style.width&&c($,V,i+Q),c(f,V,i+Q),c(M,V,S+Q)}}};D(f);var N=P+3+y.offsetHeight,A=i+3+y.offsetWidth;N>X?c(y,U,L-(N-X)+l+Q):c(y,U,L+l+Q),A>o?c(y,B,q-(A-o)+M+Q):c(y,B,q+M+Q);var T=e.$21b;T&&T.each(function(I){D(I),I.offsetHeight>X&&n(I)}),e.$9b&&(t.mockTouch&&K(p(),"touchstart",e.$9b,!0),K(p(),"mousedown",e.$9b,!0)),e.afterShow&&e.afterShow(u),e.$47b()}}}},isShowing:function(){return this._view?this._view.parentNode!=d:!1},getRelatedView:function(){return this.$12b},hide:function(){var V=this,f=V._view;f&&f.parentNode&&(R(f.parentNode,f),t.mockTouch&&$(p(),"touchstart",V.$9b,!0),$(p(),"mousedown",V.$9b,!0),V.afterHide&&V.afterHide())},dispose:function(){var E=this,o=E.$12b,b=E._view;b&&(this.hide(),E.disableGlobalKey(),o&&(t.mockTouch&&($(o,"touchstart",E.$6b,!0),$(o,"touchmove",E.$7b),$(o,"touchend",E.$8b)),$(o,"mousedown",E.$6b,!0),$(o,"mousemove",E.$7b),$(o,"mouseup",E.$8b),$(o,"contextmenu",E.$27b)),E._view=E._items=E.$21b=E.$19b=E.$12b=E.beforeShow=E.afterShow=E.afterHide=E.$9b=E.$3b=E.$6b=E.$7b=E.$8b=E.$27b=d)},$46b:function(L,$,Y,k,O){var C=s.initContext(L);s.translateAndScale(C,0,0,1),C.clearRect(0,0,Y,k),t.drawStretchImage(C,t.getImage($),"fill",0,0,Y,k,O,this),C.restore()},$47b:function(){var Z,b,$,S=this,o=S._view;if(S.isShowing()){var W=x(o,".check-prefix");for($=0;$<W.length;$++){var V=W[$];Z=V.clientWidth,b=V.clientHeight,V.$48b=Z,V.$49b=b,s.setCanvas(V,Z,b)}var O=x(o,".radio-prefix");for($=0;$<O.length;$++){var T=O[$];Z=T.clientWidth,b=T.clientHeight,T.$48b=Z,T.$49b=b,s.setCanvas(T,Z,b)}var v=x(o,".contextmenu-item-icon");for($=0;$<v.length;$++){var j=v[$];Z=j.clientWidth,b=j.clientHeight,j.$48b=Z,j.$49b=b,s.setCanvas(j,Z,b)}}},validateImpl:function(){var w,A,c,T=this,V=T._view;if(T.isShowing()){var d=x(V,".check-prefix");for(c=0;c<d.length;c++){var k=d[c];w=k.$48b,A=k.$49b,w&&A&&T.$46b(k,t.contextMenuCheckIcon,w,A)}var F=x(V,".radio-prefix");for(c=0;c<F.length;c++){var W=F[c];w=W.$48b,A=W.$49b,w&&A&&T.$46b(W,t.contextMenuRadioIcon,w,A)}var y=x(V,".contextmenu-item-icon");for(c=0;c<y.length;c++){var O=y[c];w=O.$48b,A=O.$49b,w&&A&&T.$46b(O,t.getImage(O.$50b),w,A,O._item)}}},_clearItemId:function(r){var t=this;delete r._id,r.items&&r.items.forEach(function(N){t._clearItemId(N)})}})}("undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:(0,eval)("this"),Object);