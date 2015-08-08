Dom = {
    limit: 10, 
    page: 0, 
    fields: [], 
    data: {}, 
    loaded:false,
    removeRows: function() {
        /* clear rows */
        var rows = document.getElementsByClassName("row");
        for (var i in rows)
            if (rows[0]) rows[0].parentNode.removeChild(rows[0]);
    }, 
    createHeader: function() {
        var header = document.getElementById("table-header"),
        df = Dom.fields;
        /* append first cell header */
        if(typeof header.childNodes[0] == 'undefined') 
            header.appendChild(Dom.createFirstCellRow({type:"header",i:""}));
        /* loop fields and add in the header */
        for(var f in df) {
            var d = Dom.createElement({e: "div", attr: {id: "table-header-" + df[f], className: "cell " + df[f], innerHTML: df[f]}});
            if (typeof header.getElementsByClassName(df[f])[0] == 'undefined') 
                header.appendChild(d);
        }
    },
    createElement: function(o) {
        var ob = document.createElement(o.e);
        for (var a in o.attr) {
            if (typeof o.attr[a] == "object") { /*second level example: ob.style.width */
                for (var b in o.attr[a]) ob[a][b] = o.attr[a][b];
            } else {
                ob[a] = o.attr[a];
            }
        }
        return ob;
    }, 
    addEvent: function(event, selector, callback) {
        var qs = document.querySelectorAll(selector);
        for(var i=0;i<=qs.length;i++) 
            if(typeof qs[i] !== 'undefined')
                qs[i].addEventListener(event, callback, false);

        }, 
        populate: function(id){
            document.getElementById("form-update").setAttribute("data-id", id);
            Dom.request("request/find.php?id=true&value=" + id, function(data) {
                data = JSON.parse(data);
                var fu = document.getElementById("form-update");
                for(var d=0;d<=fu.length;d++){
                    if(typeof fu[d] == 'undefined') continue;
                    var name = fu[d].getAttribute("name");
                    if(data.result[Object.keys(data.result)][name])
                        fu[d].value = data.result[Object.keys(data.result)][name];
                }

            },"");
        },
        createFirstCellRow: function(o) {
            if(o.type == 'header')
                return Dom.createElement({e: "div", attr: {id:"new", "innerHTML": "<a id='new-form' href='#form'>New</a>"}});
            var inner = "<a class='edit-form' data-id=" + o.i + " href='#form'>Edit</a>\n<a href='javascript:Dom.remove(\"" + o.i + "\")'>Remove</a>";
            return Dom.createElement({e: "div", attr: {className: "cell ", innerHTML: inner}});
        },
        createCellRow: function(o) {
            var inner = Dom.data.result[o.i][o.value] ? Dom.data.result[o.i][o.value] : " ";
            return Dom.createElement({e: "div", attr: {className: "cell " + o.value, innerHTML: inner}});
        },
        getForm:function(e){
            var p=[],
            et = e.target;
            for(var i in et)
                if(et[i] && et[0].tagName=='INPUT' && typeof et[i].value !== 'undefined') 
                    p[p.length] = et[i].name + "=" + et[i].value;
                return p;
        },
        create: function(e) {
            var p = Dom.getForm(e);
            Dom.request("request/create.php", function(data) {
                data = JSON.parse(data);
                if (data.success == true) {
                    document.getElementById("form-create").reset();
                    document.getElementsByClassName("close")[0].click();
                    Dom.list();

                }
            }, p.join("&"));
        }, 
        update: function(e){
            id = e.target.getAttribute("data-id");
            var p = Dom.getForm(e);
            Dom.request("request/update.php?id=" + id, function(data) {
                data = JSON.parse(data);
                if (data.success == true) {
                    document.getElementById("form-update").reset();
                    document.getElementsByClassName("close")[0].click();
                    Dom.list();
                }
            }, p.join("&"));

        },
        switchForm:function (id){
            document.getElementsByClassName("switch-form-update")[0].id = id;
        },
        list: function() {
            Dom.request("request/list.php?limit=" + Dom.limit, function(data) {
                Dom.removeRows();
                Dom.data = JSON.parse(data);
                var result = Dom.data.result,
                df = Dom.fields;
		if(typeof result == "undefined") Dom.createHeader();
                for (var i in result)
                    for (var j in result[i]) if (Dom.fields.indexOf(j) == -1) Dom.fields.push(j);
                for (var i in result) {
                    /*create and append first cell row */
                    var r = Dom.createElement({e: "div", attr: {className: "row", id: i}});
                    r.appendChild(Dom.createFirstCellRow({type:"row", i:i})); 
                    /* append cells */
                    for (var f in df) 
                        r.appendChild(Dom.createCellRow({ i: i, value: df[f]}));
                    Dom.createHeader();
                    document.getElementById("table").appendChild(r);
                 }
                 if(Dom.loaded == false){
                    Dom.loaded = true;
                    Dom.addEvent("click", "#new-form", function(e) {
                        Dom.switchForm("form-create");
                        var fc = document.getElementById("form-create");
                        fc.reset();
    			document.getElementById("form-create").onsubmit=function(e) {Dom.create(e);}
                        //Dom.addEvent("submit", "#form-create", function(e) {Dom.create(e);});
                    });
                    Dom.addEvent("click", ".edit-form", function(e) {
                        Dom.switchForm("form-update");
                        id = e.target.getAttribute("data-id");
                        Dom.populate(id); 
			document.getElementById("form-update").onsubmit=function(e) {Dom.update(e);}
                        Dom.addEvent("submit", "#form-update", function(e) {Dom.update(e, id);});
                    });
                }
            }, '');
        }, 
        remove: function(id) {
            Dom.request("request/delete.php?id=" + id, function(data) {
                data = JSON.parse(data);
                if (data.success == true) Dom.list();
            });
        }, 
        request: function(url, callback, params) {
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            } else {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) callback(this.responseText);
            };
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send(params);
        }
    };
    window.onload = function(){
    Dom.list();

    
};
     
    
    
