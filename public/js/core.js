"use strict";var caas={};function ucfirst(t){return t.charAt(0).toUpperCase()+t.slice(1)}caas.core={modules:["loader","popover","tooltip","element","lists"],init:function(){this.initializeCoreModules()},initializeCoreModules:function(){for(var t=0;t<this.modules.length;t++)caas[this.modules[t]].init()},initializePage:function(t,e){this.initializeModule(t,e)},initializeModule:function(t,e){if(void 0===e&&(e=caas),"object"==typeof e[t]){var i=e[t];if("object"==typeof i.load&&i.load.length>0)for(var o=0;o<i.load.length;o++)caas.loader.asyncUp(i.load[o]);if("object"!=typeof i.preload||0==i.preload.length)return i.init();i.preloadLoaded=0;for(o=0;o<i.preload.length;o++)caas.loader.queueUp(i.preload[o],function(){i.preloadLoaded++,i.preloadLoaded==i.preload.length&&i.init()})}else console.log("Attempting to load invalid module:",t)}},$.fn.toggleAttr=function(t,e){return e?$(this).attr(t,t):$(this).removeAttr(t),this},$.ajaxSetup({headers:{"X-CSRF-TOKEN":$('meta[name="csrf-token"]').attr("content"),"X-LOCALE":$("html").attr("lang")}}),function(t,e){var i,o=t.jQuery||t.Cowboy||(t.Cowboy={});o.throttle=i=function(t,i,n,a){var s,c=0;function l(){var o=this,l=+new Date-c,r=arguments;function d(){c=+new Date,n.apply(o,r)}a&&!s&&d(),s&&clearTimeout(s),a===e&&l>t?d():!0!==i&&(s=setTimeout(a?function(){s=e}:d,a===e?t-l:t))}return"boolean"!=typeof i&&(a=n,n=i,i=e),o.guid&&(l.guid=n.guid=n.guid||o.guid++),l},o.debounce=function(t,o,n){return n===e?i(t,o,!1):i(t,n,!1!==o)}}(this),caas.cookie={set:function(t,e){var i=new Date;return i.setDate(i.getDate()+365),e=escape(e)+"; domain="+cookieDomain+"; expires="+i.toUTCString()+"; path=/",document.cookie=t+"="+e,!0},get:function(t,e){t+="=";for(var i=document.cookie.split(";"),o=0;o<i.length;o++){for(var n=i[o];" "==n.charAt(0);)n=n.substring(1,n.length);if(0===n.indexOf(t))return n.substring(t.length,n.length)}return e||null},delete:function(t){document.cookie=t+"=; domain="+cookieDomain+"; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"}},caas.element={init:function(){$(document).on("click","[data-toggle=element]",this.toggle)},toggle:function(){var t=$(this);$(t.data("element")).toggleAttr("hidden",!$(t.data("element"))[0].hasAttribute("hidden"))}},caas.lists={activeList:{},init:function(){"undefined"!=typeof game&&(this.setup(),this.events())},setup:function(){this.getActiveList()},events:function(){$(document).on("click",".add-to-list",this.simpleAdd)},getActiveList:function(){var t=caas.cookie.get(game.slug+"-active-list");null!==t&&(this.activeList=JSON.parse(atob(t)))},saveActiveList:function(){caas.cookie.set(game.slug+"-active-list",btoa(JSON.stringify(this.activeList)).replace(/=*$/,"")),this.updateButtons()},simpleAdd:function(){var t=$(this),e=t.data("id"),i=t.data("type");void 0===caas.lists.activeList[i]&&(caas.lists.activeList[i]={}),void 0===caas.lists.activeList[i][e]&&(caas.lists.activeList[i][e]=0),caas.lists.activeList[i][e]++,caas.lists.saveActiveList()},updateButtons:function(){$(".add-to-list").each(function(){var t=$(this),e=t.data("id"),i=t.data("type"),o=void 0!==caas.lists.activeList[i]&&void 0!==caas.lists.activeList[i][e]&&caas.lists.activeList[i][e]>0;t.toggleClass("btn-light",!o).toggleClass("btn-primary",o).find(".badge").html(o?caas.lists.activeList[i][e]:"").toggleAttr("hidden",!o)})}},caas.loader={queue:[],callbackQueue:[],loaded:[],loading:!1,init:function(){"undefined"!=typeof assets&&(assets.filter(function(t){return"css"==t.substr(-3)}).forEach(function(t){caas.loader.asyncUp(t)}),assets.filter(function(t){return"js"==t.substr(-2)}).forEach(function(t){caas.loader.queueUp(t,void 0,!1)}),this.run())},cdnize:function(t){return t},asyncUp:function(t){t=this.cdnize(t),this.loaded.indexOf(t)>=0||(this.loaded.push(t),this.appendFile(t,!0))},queueUp:function(t,e,i){"function"!=typeof e&&(e=this.intentionallyBlank),t=this.cdnize(t),this.queue.push(t),this.callbackQueue.push(e),void 0===i&&(i=!0),0!=i&&this.run()},run:function(){if(0!=this.queue.length&&!this.loading){this.loading=!0;var t=this.queue.shift();if(this.loaded.indexOf(t)>=0)return this.finished(t);this.loaded.push(t),this.appendFile(t,!1)}},appendFile:function(t,e){return"js"==t.substr(-2)?this.appendScript(t,e):"css"==t.substr(-3)?this.appendStyle(t):void 0},appendStyle:function(t){var e=document.createElement("link");e.rel="stylesheet",e.href=t,document.head.appendChild(e)},appendScript:function(t,e){var i=document.createElement("script");i.src=t,e||i.setAttribute("onload","caas.loader.finished()"),document.body.appendChild(i)},finished:function(){this.callbackQueue.shift()(),this.loading=!1,this.run()},intentionallyBlank:function(){}},caas.popover={force:!1,init:function(){this.setup(),this.events()},setup:function(){$("[data-toggle=popover]").popover({html:!0,container:"body"})},events:function(){$("body").on("show.bs.popover",this.thereCanBeOnlyOne),$("body").on("click",this.hideOnOutsideClick)},closeAll:function(){$("[data-toggle=popover]").popover("hide")},thereCanBeOnlyOne:function(t){$("[data-toggle=popover]").not($(t.target)).popover("hide")},hideOnOutsideClick:function(t){!caas.popover.force&&$(".popover:visible").length>0&&0===$(t.target).closest("[data-original-title]").length&&!$(t.target).closest(".popover").is(".show")&&$('[aria-describedby="'+$(".popover.show").first().attr("id")+'"]').popover("hide"),caas.popover.force=!1}},caas.storage={set:function(t,e){localStorage.setItem(t,e)},get:function(t,e){var i=localStorage.getItem(t);return null===i&&void 0!==e?e:i},remove:function(t){localStorage.removeItem(t)},clear:function(){localStorage.clear()}},caas.tooltip={init:function(){$("[data-toggle=tooltip]").tooltip({html:!0,container:"body"})}},$(function(){caas.core.init()});