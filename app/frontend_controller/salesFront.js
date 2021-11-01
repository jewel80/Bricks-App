function salesTab(UN) {
    if (Ext.getCmp('Sales_')) {
        tab_panel.setActiveTab(Ext.getCmp("Sales_"));
    } else {
        var new_tab = tab_panel.add({
            title: 'ব্যয়ের সকল তথ্য',
            layout: 'fit',
            closable: true,
            id: 'Sales_',
            autoScroll: true,
            items: [SalesGrid(UN)]
        });
        tab_panel.setActiveTab(new_tab);
    }
}

function SalesGrid(UN) {
    var store = Ext.create('Ext.data.Store', {
        pageSize: 30,
        remoteSort: true,
        autoLoad: true,
        autoSync: true,
        model: Ext.define('Sales_MODEL', {
            extend: 'Ext.data.Model',
            fields: [{
                name: 'id',
                type: 'int'
            }, {
                name: 's_type',
                type: 'string',
                mapping: 'S_Type_Table.name'
            }, {
                name: 'category',
                type: 'string',
                mapping: 'Category_Table.name'
            }]
        }),
        proxy: {
            type: 'ajax',
            url: '/getSalesList',
            reader: {
                root: 'rows',
                totalProperty: 'count'
            },
            simpleSortMode: true
        },
        sorters: [{
            property: 'id',
            direction: 'ASC'
        }]
    });

    var gridPaging = Ext.create('Ext.toolbar.Paging', {
        override: 'Ext.toolbar.Paging',
        store: store,
        displayInfo: true,
        displayMsg: 'DISPLAYING {0} - {1} OF {2}',
        emptyMsg: "No records to display",
    });

    var sales_grid = Ext.create('Ext.grid.Panel', {
        id: 'sales_grid',
        store: store,
        loadMask: true,
        columnLines: true,
        viewConfig: {
            emptyText: 'No records',
            listeners: {
                afterrender: function(self, eOpts) {}
            }
        },
        features: [{
            ftype: 'summary',
            dock: 'bottom'
        }],
        tbar: [{
            xtype: 'button',
            icon: '/public/icons/create.png',
            tooltip: 'Add New Sales',
            hidden: (UN.role < 2) ? true : false,
            border: 1,
            // title:'Paid',
            style: {
                borderColor: 'blue',
                borderStyle: 'solid'
            },
            handler: function() {
                SalesFormWindow();
            }
        },{
            xtype: 'button',
            icon: '/public/icons/clear.png',
            tooltip: 'Clear The Search Boxes',
            border: 1,
            style: {
                borderColor: 'blue',
                borderStyle: 'solid'
            },
            handler: function() {
                Ext.getCmp('Sun_S_product_type_search').setValue(undefined);
                Ext.getCmp('Sun_S_expenses_reason_search').setValue(undefined);
                Ext.getCmp('Sun_S_start_date_search').setValue(undefined);
                Ext.getCmp('Sun_S_end_date_search').setValue(undefined);
                Ext.getCmp('sales_grid').getStore().load();
            }
        },  {
            xtype: 'button',
            icon: '/public/icons/refresh.png',
            tooltip: 'Reload',
            style: {
                borderColor: 'blue',
                borderStyle: 'solid'
            },
            handler: function() {
                Ext.getCmp('sales_grid').paramsReload();
            }
        },Ext.create('Ext.form.field.Date', {
            id: 'Sun_S_start_date_search',
            name: 'from_date',
            padding: 5,
            border: 2,
            editable: true,
            style: {
                borderColor: 'green',
                borderStyle: 'solid'
            },
            emptyText: 'শুরু তারিখ...',
            listeners: {
                change: {
                    fn: function(combo, value) {
                        sales_grid.paramsReload({
                            from_date: value
                        });
                        Ext.getCmp('Sun_S_end_date_search').setDisabled(false);
                    }
                }
            }
        }), Ext.create('Ext.form.field.Date', {
            id: 'Sun_S_end_date_search',
            name: 'to_date',
            padding: 5,
            border: 2,
            editable: true,
            disabled: true,
            style: {
                borderColor: 'green',
                borderStyle: 'solid'
            },
            emptyText: 'শেষ তারিখ...',
            listeners: {
                change: {
                    fn: function(combo, value) {
                        sales_grid.paramsReload({
                            to_date: value
                        });
                        Ext.getCmp('Sun_S_product_type_search').setDisabled(false);
                    }
                }
            }
        }), Ext.create('Ext.form.field.ComboBox', {
            name: 'category',
            id: 'Sun_S_product_type_search',
            editable: false,
            disabled: true,
            emptyText: 'ক্যাটাগরি-ভিত্তিক...',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
            editable: true,
            autoScroll: true,
            selectOnFocus: true,
            triggerAction: 'all',
            anyMatch: true,
            typeAhead: true,
            transform: 'stateSelect',
            forceSelection: true,
            padding: 5,
            border: 2,
            style: {
                borderColor: 'green',
                borderStyle: 'solid'
            },
            store: {
                fields: ['id', 'name'],
                pageSize: 0,
                limit: 0,
                proxy: {
                    type: 'ajax',
                    url: '/getCategoryList',
                    reader: {
                        root: 'rows'
                    }
                },
                autoLoad: true,
                autoSync: true
            },
            listeners: {
                change: {
                    fn: function(field, value) {
                        sales_grid.paramsReload({
                            category: value
                        });
                    }
                }
            }
        }), Ext.create('Ext.form.field.Text', {
            name: 'expenses_reason',
            id: 'Sun_S_expenses_reason_search',
            emptyText: 'ব্যয়ের কারণ খুঁজুন...',
            padding: 5,
            border: 2,
            style: {
                borderColor: 'green',
                borderStyle: 'solid'
            },
            listeners: {
                change: {
                    fn: function(field, value) {
                        if (value.length > 3) {
                            sales_grid.paramsReload({
                                expenses_reason: value
                            });
                        }
                    }
                }
            }
        }),  gridPaging],
        columns: [Ext.create('Ext.grid.RowNumberer', {
            width: 70,
            summaryType: 'count',
            summaryRenderer: function(value, summaryData, dataIndex) {
                return '<b><big>TOTAL:</big></b> ';
            }
        }), {
            header: 'ব্যয়ের কারণ',
            dataIndex: 'expenses_reason',
            align: 'left',
            editor: 'textfield',
            flex: .5,
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
        }, {
            header: 'তারিখ',
            dataIndex: 'sales_date',
            tdCls: 'x-change-cell',
            renderer: Ext.util.Format.dateRenderer('d-M-Y'),
            align: 'center',
            flex: .3,
            editor: {
                xtype: 'datefield',
            },
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
        }, {
            header: 'ক্যাটাগরি-ভিত্তিক',
            dataIndex: 'category',
            align: 'left',
            // editor: 'textfield',
            flex: .6,
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
        }, {
            header: 'খরচের পরিমাণ/টাকা',
            dataIndex: 'cost',
            align: 'left',
            editor: 'numberfield',
            flex: .6,
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
            summaryType: 'sum',
            renderer: function(value, metaData, record, rowIdx, colIdx, store, view) {
                return value.formatMoney(2, '.', ',');
            },
            summaryRenderer: function(value, summaryData, field, metaData) {
                return '<b><big>' + Ext.String.format('{0}', value.formatMoney(2, '.', ',')) + '</big></b>';
            },
        }, {
            header: 'কোন খাদে',
            dataIndex: 's_type',
            align: 'left',
            // editor: 'textfield',
            flex: .2,
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
        }, {
            header: 'বর্ণনা',
            dataIndex: 'remark',
            align: 'left',
            editor: 'textfield',
            flex: .5,
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
        }, {
            xtype: 'actioncolumn',
            header: 'DELETE',
            width: 75,
            // hideable: true,
            // hidden: (UN.role < 2) ? false : true,
            icon: '/public/icons/delete.png',
            tooltip: 'Delete',
            handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
                Ext.Msg.show({
                    title: 'Delete Confirm?',
                    msg: 'Are you sure you want to delete this information. <br>It will permanently delete this information from the server',
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.Msg.WARNING,
                    fn: function(btn, text) {
                        if (btn == 'yes') {
                            var QUERY = {}
                            QUERY.id = record.data.id;
                            Ext.Ajax.request({
                                url: '/DestroySales',
                                method: 'POST',
                                params: QUERY,
                                success: function(response) {
                                    if (response.responseText == 'success') {
                                        if (Ext.getCmp('sales_grid')) {
                                            Ext.getCmp('sales_grid').getStore().load();
                                        }
                                        Ext.MessageBox.alert('Success', 'Successfully data Deleted');
                                    } else {
                                        Ext.MessageBox.alert('Error', 'It Has Been Alocated In Another Functions');
                                    }
                                },
                                failure: function(response) {
                                    Ext.MessageBox.alert('Error',
                                        'Please contact with the developer');
                                }
                            });
                        }
                    }
                });
            },
            align: 'center'
        }],
        selModel: 'cellmodel',
        plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 2,
            autoCancel: false
        })],
    });
    store.loadPage(1);
    return sales_grid;
}

function SalesFormWindow() {
    return Ext.create('Ext.window.Window', {
        title: 'ব্যয়ের তথ্য যুক্ত করুন',
        modal: true,
        id: 'SalesFormWindow',
        layout: 'fit',
        items: [Ext.create('Ext.form.Panel', {
            width: '35%',
            bodyPadding: 20,
            border: true,
            items: [{
                layout: 'hbox',
                border: false,
                align: 'stretch',
                bodyStyle: 'padding-bottom: 7px;',
                items: [{
                    xtype: 'combo',
                    name: 'category',
                    fieldLabel: 'ক্যাটাগরি',
                    id: 'category_class_combo_load',
                    allowBlank: false,
                    editable: true,
                    width: 280,
                    labelWidth: 80,
                    labelAlign: 'left',
                    labelSeparator: '',
                    emptyText: 'ক্যাটাগরি-ভিত্তিক সিলেক্ট করুন...',
                    labelClsExtra: 'some-class',
                    fieldStyle: 'text-align: left;font-size: 12px;',
                    autoScroll: true,
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    selectOnFocus: true,
                    triggerAction: 'all',
                    anyMatch: true,
                    typeAhead: true,
                    transform: 'stateSelect',
                    forceSelection: true,
                    store: {
                        fields: ['id', 'name'],
                        pageSize: 0,
                        limit: 0,
                        proxy: {
                            type: 'ajax',
                            url: '/getCategoryList',
                            reader: {
                                root: 'rows'
                            }
                        },
                        autoLoad: true,
                        autoSync: true
                    }
                }, {
                    xtype: 'button',
                    icon: '/public/icons/create.png',
                    tooltip: 'ক্যাটাগরি-ভিত্তিক যুক্ত করুন',
                    border: 1,
                    handler: function() {
                        categoryFormWindow();
                    }
                }]
            }, {
                xtype: 'datefield',
                name: 'sales_date',
                fieldLabel: 'তারিখ',
                filedAlign: 'top',
                allowBlank: false,
                format: 'd F Y',
                width: 300,
                editable: false,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'তারিখ লিখুন...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: false
            },  {
                layout: 'hbox',
                border: false,
                align: 'stretch',
                bodyStyle: 'padding-bottom: 7px;',
                items: [{
                    xtype: 'combo',
                    name: 's_type',
                    fieldLabel: 'কোন খাদে',
                    allowBlank: true,
                    editable: false,
                    width: 300,
                    labelWidth: 80,
                    labelAlign: 'left',
                    labelSeparator: '',
                    emptyText: 'খাদ সিলেক্ট করুন...',
                    labelClsExtra: 'some-class',
                    fieldStyle: 'text-align: left;font-size: 12px;',
                    autoScroll: true,
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    selectOnFocus: false,
                    triggerAction: 'all',
                    anyMatch: false,
                    typeAhead: false,
                    transform: 'stateSelect',
                    forceSelection: true,
                    store: {
                        fields: ['id', 'name'],
                        pageSize: 0,
                        limit: 0,
                        proxy: {
                            type: 'ajax',
                            url: '/getSTypeList',
                            reader: {
                                root: 'rows'
                            }
                        },
                        autoLoad: true,
                        autoSync: true
                    }
                }]
            }, {
                xtype: 'numberfield',
                name: 'cost',
                fieldLabel: 'পরিমাণ/টাকা ',
                filedAlign: 'top',
                allowBlank: false,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'খরচের পরিমাণ লিখুন...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: true
            }, {
                xtype: 'textfield',
                name: 'expenses_reason',
                fieldLabel: 'ব্যয়ের কারণ ',
                filedAlign: 'top',
                allowBlank: true,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'ব্যয়ের কারণ লিখুন...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: true
            },{
                xtype: 'textfield',
                name: 'remark',
                fieldLabel: 'বর্ণনা ',
                filedAlign: 'top',
                allowBlank: true,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'বর্ণনা লিখুন...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: true
            }, ],
            buttons: [{
                text: 'Reset',
                handler: function() {
                    this.up('form').getForm().reset();
                }
            }, {
                text: 'Submit',
                formBind: true,
                handler: function() {
                    var panel = this.up('form');
                    var form = panel.getForm();
                    var values = form.getValues();
                    for (var key in values) {
                        if (values[key] === '') {
                            values[key] = null;
                        }
                    }
                    Ext.Ajax.request({
                        url: '/CreateSales',
                        method: 'POST',
                        params: values,
                        success: function(response) {
                            if (Ext.getCmp('sales_grid')) {
                                Ext.getCmp('sales_grid').getStore().load();
                            }
                            Ext.MessageBox.alert('Success', 'Successfully data Inserted');
                            Ext.getCmp('SalesFormWindow').close()
                        },
                        failure: function(response) {
                            Ext.MessageBox.alert('Error',
                                'Please contact with the developer');
                        }
                    });
                }
            }, {
                text: 'Close',
                handler: function() {
                    Ext.getCmp('SalesFormWindow').close()
                }
            }]
        })]
    }).show();
}

function categoryFormWindow() {
    return Ext.create('Ext.window.Window', {
        title: 'ক্যাটাগরি-ভিত্তিক যুক্ত করুন',
        modal: true,
        id: 'categoryFormWindow',
        layout: 'fit',
        items: [Ext.create('Ext.form.Panel', {
            width: '35%',
            bodyPadding: 20,
            border: true,
            items: [{
                xtype: 'textfield',
                name: 'name',
                fieldLabel: 'ক্যাটাগরি নাম',
                filedAlign: 'top',
                allowBlank: false,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'ক্যাটাগরি নাম লিখুন...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: true
            }, {
                xtype: 'textfield',
                name: 'details',
                fieldLabel: 'বিস্তারিত ',
                filedAlign: 'top',
                allowBlank: true,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'বিস্তারিত লিখুন...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: true
            }, ],
            buttons: [{
                text: 'Reset',
                handler: function() {
                    this.up('form').getForm().reset();
                }
            }, {
                text: 'Submit',
                formBind: true,
                handler: function() {
                    var panel = this.up('form');
                    var form = panel.getForm();
                    var values = form.getValues();
                    for (var key in values) {
                        if (values[key] === '') {
                            values[key] = null;
                        }
                    }
                    Ext.Ajax.request({
                        url: '/CreateCategory',
                        method: 'POST',
                        params: values,
                        success: function(response) {
                            if (Ext.getCmp('category_class_combo_load')) {
                                Ext.getCmp('category_class_combo_load').getStore().load();
                            }
                            Ext.MessageBox.alert('Success', 'Successfully data Inserted');
                            Ext.getCmp('categoryFormWindow').close()
                        },
                        failure: function(response) {
                            Ext.MessageBox.alert('Error',
                                'Please contact with the developer');
                        }
                    });
                }
            }, {
                text: 'Close',
                handler: function() {
                    Ext.getCmp('categoryFormWindow').close()
                }
            }]
        })]
    }).show();
}