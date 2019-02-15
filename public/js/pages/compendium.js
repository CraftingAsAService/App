"use strict";axios.defaults.headers.common={"X-Requested-With":"XMLHttpRequest","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")};var compendium=new Vue({el:"#compendium",data:{firstLoad:!0,searchTerm:"undefined"!=typeof searchTerm?searchTerm:"",chapter:"items",sorting:"name:asc",perPage:15,filters:{},addFilter:"",activeFilters:[],noResults:!0,results:{data:[],links:{},meta:{}}},mounted:function(){this.initializeDropdowns(),this.buildRanges(),this.searchTerm&&this.search()},watch:{addFilter:function(e){this.activeFilters.push(e)}},methods:{initializeDropdowns:function(){$("#compendium").find("select.cs-select").each(function(){var e=$(this).data("compendium-var");new SelectFx(this,{onChange:function(t){compendium[e]=t}})})},search:function(){var e="items";"quests"==this.chapters&&(e="quests");var t=Object.assign({},this.filters);t.name=this.searchTerm,t.sorting=this.sorting.split(":")[0],t.ordering=this.sorting.split(":")[1],t.perPage=this.perPage,axios.post("/api/"+e,t).then(e=>{this.results=e.data,this.firstLoad=!1}).catch(e=>console.log(e))},buildRanges:function(){$(".slider-range").each(function(){var e=$(this),t=e[0],i=parseInt(e.data("min")),a=parseInt(e.data("max")),s=[e.parent().find(".min"),e.parent().find(".max")];noUiSlider.create(t,{start:[i,a],connect:!0,step:1,range:{min:[i],max:[a]}}),t.noUiSlider.on("update",function(e,t){s[t].html(e[t].replace(".00",""))})})},removeFilter:function(e){this.activeFilters=this.activeFilters.filter(function(t){return t!=e}),this.applyFilter(e)},applyFilter:function(e){var t=$(".widget.-filter.-"+e),i=t.data("type");if(t.is(":visible")){if("range"==i){r=(l=t.find(".slider-range")).data("keys").split(",");var a=parseInt(l.parent().find(".min").html()),s=parseInt(l.parent().find(".max").html());this.filters[r[0]]=a,this.filters[r[1]]=s}else if("multiple"==i){var n=t.find("input:checkbox:checked").map(function(){return this.value}).get();this.filters[e]=n}}else if("range"==i){var l,r=(l=t.find(".slider-range")).data("keys").split(",");this.filters.delete(r[0]),this.filters.delete(r[1])}else this.filters.delete(e);void 0!==this.filters.page&&this.filters.delete("page"),this.search()},previousPage:function(){},nextPage:function(){},searchFocus:function(){$(".search-form :input").focus().select()},filterAdded:function(){var e=this.addFilter;console.log(e),activeFilters.push(e),this.addFilter=""}}});let defaultFilters={chapter:"items",sorting:"name",ordering:"asc",active:[]};var OLDcompendium={filters:Object.assign({},defaultFilters),results:null,pause:!1,init:function(){this.setup(),this.events()},setup:function(){this.restoreFilters()},events:function(){$("#chapter-select .dropdown-item").on("click",this.chapterSelect),$("a.page-link").on("click",this.paginate),$("input[name=name]").on("keyup keypress focus blur change",this.searchWidth).on("keyup keypress change blur",$.debounce(250,!1,caas.compendium.search)),$("#name-filter .dropdown-item").on("click",this.sorting),$("#select-filters .dropdown-item").on("click",this.createFilter),$("body").on("click",this.closeFilter).on("click",".filter",this.activateFilter).on("click",".filter .delete",this.destroyFilter),$(".large-view").on("click",this.switchView)},chapterSelect:function(e){void 0!==e&&e.preventDefault();var t=$(this),i=t.data("chapter");t.siblings().removeClass("active"),t.addClass("active"),$("#chapter").html(t.text()),$("#filters [data-chapter]").each(function(){var e=$(this),t=e.data("chapter");e.toggleAttr("hidden",-1===t.indexOf(i))}),caas.compendium.filters.chapter=i,$("#results").attr("data-chapter",i),caas.compendium.getResults()},switchView:function(e){void 0!==e&&e.preventDefault();var t=$("#results").hasClass("-large-view");$("#results").toggleClass("-large-view",!t),$(".large-view .-disable").toggleAttr("hidden",t),$(".large-view .-enable").toggleAttr("hidden",!t)},activateFilter:function(e){var t=$(this);t.hasClass("-active")||(void 0!==e&&e.preventDefault(),$("#filtration .filter").removeClass("-active").css("left","inherit"),t.addClass("-active"),setTimeout(function(){var e=t.find(".delete"),i=e.offset().left+e.outerWidth()+16-$(window).width();i>0&&t.css("left","-"+i+"px")},250),0==t.find("input:focus").length&&t.find("input:visible").first().focus())},closeFilter:function(e){if(void 0!==e&&($(e.target).closest(".filter").length>0||0==$("#filtration .filter.-active").length))return;var t=$("#filtration .filter.-active").first(),i=t.data("filter"),a=t.data("type"),s=t.hasClass("-keep");if(t.removeClass(s?"-keep":"-active"),s||t.css("left","inherit"),"enabled"==a)caas.compendium.filters[i]="true";else if("single"==a)caas.compendium.filters[i]=t.find('input[name="'+i+'"]').val();else if("range"==a){var n=t.data("keys");caas.compendium.filters[n[0]]=t.find('input[name="'+n[0]+'"]').val(),caas.compendium.filters[n[1]]=t.find('input[name="'+n[1]+'"]').val()}else{var l=t.find("input").attr("name").replace(/\[\]$/,""),r=[];t.find("input:checked").each(function(){r.push($(this).val())}),caas.compendium.filters[l]=r.join(",");var c=t.find(".values");if(""==caas.compendium.filters[l].length)c.find("img, i, .multiple").toggleAttr("hidden",!0),c.find(".waiting-icon").toggleAttr("hidden",!1);else{var o=t.find("input:checked").length>1,d=t.find("input:checked").first().next("label").children().first();c.find("img, i").toggleAttr("hidden",!1),d.is("i")?c.find("i").first().attr("class",d.attr("class")):d.is("img")&&c.find("img").first().attr("src",d.attr("src")),c.find(".multiple").toggleAttr("hidden",!o),c.find(".waiting-icon").toggleAttr("hidden",!0)}}caas.compendium.getResults()},destroyFilter:function(e){var t=$(this).closest(".filter"),i=t.data("filter"),a=t.data("type");if(t.is(".-active")||caas.compendium.pause){if("enabled"==a||"single"==a)delete caas.compendium.filters[i];else if("range"==a){var s=t.data("keys");delete caas.compendium.filters[s[0]],delete caas.compendium.filters[s[1]]}else{var n=t.find("input").attr("name").replace(/\[\]$/,"");delete caas.compendium.filters[n]}var l=caas.compendium.filters.active.indexOf(i);l>-1&&caas.compendium.filters.active.splice(l),t.remove(),$('#select-filters .dropdown-item[data-filter="'+i+'"]').removeClass("disabled"),caas.compendium.getResults()}},createFilter:function(e){void 0!==e&&e.preventDefault();var t=$(this);if(!t.hasClass("disabled")){var i=t.data("filter");if("clear"==i)return caas.compendium.clearFilters();var a=t.data("type"),s=t.data("text")||t.text(),n=t.find("i").attr("class"),l=$("#filters .filter.-"+a).clone();if(t.addClass("disabled"),l.find(".filter-icon").addClass(n),l.find(".filter-label").html(s),l.data("filter",i).data("type",a),"enabled"==a)l.find("input").attr("name",i);else if("single"==a){var r=l.find("input");r.attr("name",i).attr("min",t.data("min")).attr("max",t.data("max"));var c=t.data("list");if(void 0!==c){var o=$('<datalist id="'+i+'List"></datalist>');r.attr("list",i+"List"),$.each(c.split(","),function(){o.append($('<option value="'+this+'"></option>'))}),o.insertAfter(r)}}else if("range"==a){var d=l.find("input"),m=t.data("keys").split(",");l.data("keys",m),d.first().attr("name",m[0]),d.last().attr("name",m[1]),d.attr("min",t.data("min")).attr("max",t.data("max"))}$("#filtration").append(l),caas.compendium.filters.active.push(i),caas.pause||(caas.tooltip.init(),caas.compendium.activateFilter.call(l),l.addClass("-keep"),"enabled"==a&&(caas.compendium.getResults(),setTimeout(function(){l.removeClass("-active"),l.css("left","inherit")},500)))}},clearFilters:function(){this.pause=!0,$("#name-filter input").val(""),this.sorting.call($("#name-filter .dropdown-item").first()),$("#filtration .filter .delete").each(function(){caas.compendium.destroyFilter.call($(this))}),this.pause=!1,$("#pre-results").toggleAttr("hidden",!1),$("#no-results").toggleAttr("hidden",!0),$("#results .compendium-item:not(.-template)").remove(),this.filters=Object.assign({},defaultFilters),caas.storage.remove(game.slug+"-compendium-filters"),caas.storage.remove(game.slug+"-compendium-results"),$("#name-filter input").focus()},searchWidth:function(){var e=$(this);e.css("width",7*(e.val().length+2)+24+"px")},search:function(e){var t=(caas.compendium.filters.name||"")+"";caas.compendium.filters.name=$(this).val(),t!=caas.compendium.filters.name&&caas.compendium.getResults()},getResults:function(e){if(!caas.compendium.pause){void 0!==this.jqXHR&&this.jqXHR.abort(),void 0===e&&(e=1),this.filters.page=e,this.toggleLoader(!0);var t=Object.assign({},this.filters);delete t.chapter,delete t.active,this.jqXHR=$.ajax({method:"GET",url:"/api/"+this.filters.chapter,data:t,dataType:"json"}).done(this.buildResults).always(function(){caas.compendium.toggleLoader(!1)})}},toggleLoader:function(e){$("#select-filters > button > i").toggleClass("fa-filter",!e).toggleClass("fa-cog fa-spin",e)},buildResults:function(e){caas.compendium.pause||(caas.storage.set(game.slug+"-compendium-filters",JSON.stringify(caas.compendium.filters)),caas.storage.set(game.slug+"-compendium-results",JSON.stringify(e)));caas.compendium.filters;if($("#pre-results").toggleAttr("hidden",!0),$("#no-results").toggleAttr("hidden",0!=e.data.length),0!=e.data.length){var t=$("#results"),i=t.find(".-template");t.find(".compendium-item:not(.-template)").remove(),$.each(e.data,function(e,t){var a=i.clone(!0);a=caas.compendium.buildRow(a,t),caas.lists.updateButtons(),a.removeClass("-template"),a.toggleAttr("hidden",!1),a.insertBefore(i)}),caas.tooltip.init(),caas.compendium.buildNavigation(e)}},buildNavigation:function(e){$("#pageNumber").html(e.meta.current_page),["prev","next"].forEach(function(t){var i=$(".page-link.-"+t),a=e.links[t],s=null!==a;s?(i.toggleAttr("tabindex",!1),a=a.replace(/^.*page=/,"")):i.attr("tabindex","-1"),i.data("page",a).closest(".page-item").toggleClass("disabled",!s)})},paginate:function(e){e.preventDefault();var t=$(this);t.closest(".page-item").hasClass("disabled")||caas.compendium.getResults(t.data("page"))},buildRow:function(e,t){if(e.find("> img").attr("src","/assets/"+game.slug+"/item/"+t.icon+".png"),e.find(".name").addClass("rarity-"+t.rarity).html(t.name),e.find(".ilvl").html(t.ilvl),e.find(".category").html(t.category),void 0!==t.recipes){var i=t.recipes[0];if(e.find(".recipes .level").html(i.level),null!==i.sublevel&&i.sublevel>0)for(var a=0;a<i.sublevel;a++)e.find(".recipes .level").append('<span class="sublevel-icon"></span>');e.find(".recipes .job img").first().attr("src","/assets/"+game.slug+"/jobs/crafting-"+i.job.icon+".png"),2==t.recipes.length?(e.find(".recipes .job img").last().attr("src","/assets/"+game.slug+"/jobs/crafting-"+t.recipes[1].job.icon+".png"),e.find(".recipes .multiple").remove()):t.recipes.length>2?(e.find(".recipes .job img").last().remove(),e.find(".recipes .multiple").html("✚").attr("data-toggle","tooltip").attr("title",i.job.icon+" + "+(t.recipes.length-1)+" others")):(e.find(".recipes .multiple").remove(),e.find(".recipes .job img").last().remove())}else e.find(".recipes").remove();return void 0!==t.equipment?(e.find(".equipment .level").html(t.equipment.level),e.find(".equipment .job img").first().attr("src","/assets/"+game.slug+"/jobs/"+t.equipment.jobs[0].icon+".png"),2==t.equipment.jobs.length?(e.find(".equipment .job img").last().attr("src","/assets/"+game.slug+"/jobs/"+t.equipment.jobs[1].icon+".png"),e.find(".equipment .multiple").remove()):t.equipment.jobs.length>2?(e.find(".equipment .job img").last().remove(),e.find(".equipment .multiple").html("✚").attr("data-toggle","tooltip").attr("title",t.equipment.jobs[0].icon+" + "+(t.equipment.jobs.length-1)+" others")):(e.find(".equipment .multiple").remove(),e.find(".equipment .job img").last().remove())):e.find(".equipment").remove(),e.find(".add-to-list").data("id",t.id),e},restoreFilters:function(){this.pause=!0;var e=JSON.parse(caas.storage.get(game.slug+"-compendium-filters"))||Object.assign({},this.filters),t=JSON.parse(caas.storage.get(game.slug+"-compendium-results"));if(null!=t&&void 0!==t.data&&this.buildResults(t),this.chapterSelect.call($('#chapter-select [data-chapter="'+e.chapter+'"]')),$("#filtration input[name=name]").val(e.name),this.searchWidth.call($("input[name=name]")),this.sorting.call($('#name-filter .dropdown-item[data-sorting="'+e.sorting+'"][data-ordering="'+e.ordering+'"]')),e.active.length>0)for(var i=0;i<e.active.length;i++){var a=e.active[i],s=$('#select-filters .dropdown-item[data-filter="'+a+'"]'),n=s.data("filter"),l=s.data("type");this.createFilter.call(s);var r=$("#filtration .filter").last();if("enabled"==l);else if("single"==l)void 0!==e[n]&&r.find("input").val(e[n]);else if("range"==l)r.find("input").each(function(){var t=$(this);t.val(e[t.attr("name")])});else if(void 0!==e[n])for(var c=e[n].split(","),o=0;o<c.length;o++)r.find('input[name="'+n+'[]"][value="'+c[o]+'"]').prop("checked",!0);this.closeFilter(),r.removeClass("-active"),r.css("left","inherit")}$("#name-filter input").focus(),this.filters=e,caas.tooltip.init(),this.pause=!1},sorting:function(e){void 0!==e&&e.preventDefault();var t=$(this);t.siblings(".dropdown-item").removeClass("active"),t.addClass("active"),$("#name-filter .dropdown-toggle").html(t.html()),caas.compendium.filters.sorting=t.data("sorting"),caas.compendium.filters.ordering=t.data("ordering"),caas.compendium.getResults()},toggleFilter:function(){$("html").toggleClass("filter-open")}};