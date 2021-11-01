let yearF = new Date().getFullYear();
var footer_panel = Ext.create('Ext.toolbar.Toolbar', {
    region: 'south',
    border: false,
    items: [{
        xtype: 'tbtext',
        text: '<small><i>Developed By Jewel Rana (Email: m.jewelrana80@gmail.com, Contact: +880 1756-877781 )</i></small>'
    }, '->', {
        xtype: 'tbtext',
        text: '<small><i>©' + yearF + ' Sun Bricks Ltd. All rights reserved</i></small>'
    }]
});

var tab_panel = Ext.create('Ext.tab.Panel', {
    region: 'center',
    layout: 'border',
    bodyStyle: {
        color: '#000000',
        // backgroundImage: 'url(/public/images/orogonic_logo.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '50% 90%',
        backgroundPosition: 'center center'
    },
    id: 'tab_panel',
    items: []
});

var navigation_panel = Ext.create('Ext.panel.Panel', {
    region: 'west',
    title: title,
    tbar: [Ext.create('Ext.Img', {
        src: '/public/icons/user.png',
        height: 30,
        width: 30,
        margins: '5 5 5 5'
    }), {
        xtype: 'tbtext',
        text: user.username
    }, '->', {
        icon: '/public/icons/shut_down.png',
        iconCls: 'add',
        name: 'sign_out',
        tooltip: 'Sign Out',
        handler: function() {
            window.location.href = site_url + 'logout';
        }
    }],
    icon: '/public/images/orogonic_logo.png',
    width: 200,
    split: true,
    collapsible: true,
    collapsed: false,
    floatable: false,
    header: false,
    layout: 'accordion',
    layoutConfig: {
        titleCollapse: false,
        animate: true,
        activeOnTop: true
    },
    items: [nagadNavigation(user)]
});

function nagadNavigation(user) {
    return Ext.create('Ext.tree.Panel', {
        title: title,
        icon: '/public/icons/form.png',
        collapsible: true,
        collapsed: false,
        animate: true,
        rootVisible: false,
        autoScroll: true,
        border: false,
        store: {
            proxy: {
                type: 'ajax',
                api: {
                    read: '/getNavigationTree/' + user.id
                },
                reader: {
                    type: 'json',
                    successProperty: 'success',
                    idProperty: 'id',
                },
            },
            root: {
                expanded: true,
                loaded: true,
            },
            autoLoad: true
        },
        listeners: {
            itemclick: function(s, r) {
                switch (r.data.text) {
                    case "User List":
                        userTab(r.data.menuData);
                        break;
                    case "Navigation List":
                        navigationTab(r.data.menuData);
                        break;
                        /////////////////////////////////
                        /////////////////////////////////
                        // case "KYC Upload File":
                        //     kycArchiveFileUploadWindow(r.data.menuData);
                        //     break;
                        //     case "Upload duplicate remove":

                    case "Excel Upload File":
                        XlUploadDuplicateRemoveWindow(r.data.menuData);
                        break;
                        /////////////////////////////////
                        /////////////////////////////////  

                    case "বিক্রয় তথ্য":
                        expensesTab(r.data.menuData);
                        break;
                    case "ব্যয়ের  তথ্য":
                        salesTab(r.data.menuData);
                        break;
                    case "অন্যান্য":
                        othersTab(r.data.menuData);
                        break;
                }
            }
        }
    });
}









Date.prototype.monthDays = function() {
    var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
    return d.getDate();
}

var site_url = window.location.href;

var changingImage = Ext.create('Ext.Img', {
    src: '/public/images/orogonic_logo.png',
    height: 25,
    width: 22,
    margins: '8 10 0 0'
});

function popFromArray(myArray, value) {
    var index = myArray.indexOf(value);
    if (index > -1) {
        myArray.splice(index, 1);
    }
}

var myRender = function(value, metaData, record, rowIndex, colIndex, store, view) {
    if (parseInt(value) == 1) {
        metaData.attr = 'style="background-color:#ffaaaa !important;"';
    }
    return value
};

var grossIncome;
var grossExpense;


Ext.define('Ext.form.field.Month', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.monthfield',
    requires: ['Ext.picker.Month'],
    alternateClassName: ['Ext.form.MonthField', 'Ext.form.Month'],
    selectMonth: null,
    emptyText: 'Select Month',
    editable: false,
    allowBlank: true,
    createPicker: function() {
        var me = this,
            format = Ext.String.format;
        return Ext.create('Ext.picker.Month', {
            pickerField: me,
            ownerCt: me.ownerCt,
            renderTo: document.body,
            floating: true,
            hidden: true,
            focusOnShow: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            listeners: {
                select: {
                    scope: me,
                    fn: me.onSelect
                },
                monthdblclick: {
                    scope: me,
                    fn: me.onOKClick
                },
                yeardblclick: {
                    scope: me,
                    fn: me.onOKClick
                },
                OkClick: {
                    scope: me,
                    fn: me.onOKClick
                },
                CancelClick: {
                    scope: me,
                    fn: me.onCancelClick
                }
            },
            keyNavConfig: {
                esc: function() {
                    me.collapse();
                }
            }
        });
    },
    onCancelClick: function() {
        var me = this;
        me.selectMonth = null;
        me.collapse();
    },
    onOKClick: function() {
        var me = this;
        if (me.selectMonth) {
            me.setValue(me.selectMonth);
            me.fireEvent('select', me, me.selectMonth);
        }
        me.collapse();
    },
    onSelect: function(m, d) {
        var me = this;
        me.selectMonth = new Date((d[0] + 1) + '/1/' + d[1]);
    }
});
Ext.override(Ext.grid.Panel, {
    paramsReload: function(a) {
        var me = this;
        var p = me.getStore().lastOptions.params,
            x = (a) ? a : {},
            y = (p) ? p : {},
            r = {};
        Object.keys(y).forEach(k => r[k] = y[k]);
        Object.keys(x).forEach(k => r[k] = x[k]);
        me.getStore().load({
            params: r,
            scope: this
        })
    }
});

Number.prototype.formatMoney = function(c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};


//==========graph==============//
Ext.define('ChartsKitchenSink.view.charts.column.Basic', {
    extend: 'Ext.Panel',
    xtype: 'basic-column',


    initComponent: function() {
        var me = this;

        this.myDataStore = Ext.create('Ext.data.JsonStore', {
            fields: ['month', 'data1' ],
            data: [
                { month: 'Jan', data1: 20 },
                { month: 'Feb', data1: 20 },
                { month: 'Mar', data1: 19 },
                { month: 'Apr', data1: 18 },
                { month: 'May', data1: 18 },
                { month: 'Jun', data1: 17 },
                { month: 'Jul', data1: 16 },
                { month: 'Aug', data1: 16 },
                { month: 'Sep', data1: 16 },
                { month: 'Oct', data1: 16 },
                { month: 'Nov', data1: 15 },
                { month: 'Dec', data1: 15 }
            ]
        });


        me.items = [{
            xtype: 'chart',
            height: 410,
            style: 'background: #fff',
            padding: '10 0 0 0',
            insetPadding: 40,
            animate: true,
            shadow: false,
            store: this.myDataStore,
            items: [{
                type  : 'text',
                text  : 'Column Charts - Basic Column',
                font  : '22px Helvetica',
                width : 100,
                height: 30,
                x : 40, //the sprite x position
                y : 12  //the sprite y position
            }, {
                type: 'text',
                text: 'Data: Browser Stats 2012',
                font: '10px Helvetica',
                x: 12,
                y: 380
            }, {
                type: 'text',
                text: 'Source: http://www.w3schools.com/',
                font: '10px Helvetica',
                x: 12,
                y: 390
            }],
            axes: [{
                type: 'Numeric',
                position: 'left',
                fields: ['data1'],
                label: {
                    renderer: function(v) { return v + '%'; }
                },
                grid: true,
                minimum: 0
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['month'],
                grid: true,
                label: {
                    rotate: {
                        degrees: -45
                    }
                }
            }],
            series: [{
                type: 'column',
                axis: 'left',
                xField: 'month',
                yField: 'data1',
                style: {
                    opacity: 0.80
                },
                highlight: {
                    fill: '#000',
                    'stroke-width': 20,
                    stroke: '#fff'
                },
                tips: {
                    trackMouse: true,
                    style: 'background: #FFF',
                    height: 20,
                    renderer: function(storeItem, item) {
                        this.setTitle(storeItem.get('month') + ': ' + storeItem.get('data1') + '%');
                    }
                }
            }]
        }];

        this.callParent();
    }
});