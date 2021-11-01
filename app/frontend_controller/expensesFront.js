function expensesTab(UN) {
    if (Ext.getCmp('expenses_')) {
        tab_panel.setActiveTab(Ext.getCmp("expenses_"));
    } else {
        var new_tab = tab_panel.add({
            title: 'বিক্রয়ের সকল  তথ্য',
            layout: 'fit',
            closable: true,
            id: 'expenses_',
            autoScroll: true,
            items: [expensesGrid(UN)]
        });
        tab_panel.setActiveTab(new_tab);
    }
}

function expensesGrid(UN) {
    var store = Ext.create('Ext.data.Store', {
        pageSize: 30,
        remoteSort: true,
        autoLoad: true,
        autoSync: true,
        model: Ext.define('EXPENSES_MODEL', {
            extend: 'Ext.data.Model',
            fields: [{
                name: 'id',
                type: 'int'
            }, {
                name: 'deposit_type',
                type: 'string',
                mapping: 'Deposit_Type_Table.name'
            }, {
                name: 'bricks_class',
                type: 'string',
                mapping: 'Bricks_Class_Table.name'
            }, {
                name: 'vehicles',
                type: 'string',
                mapping: 'Vehicles_Table.vehicle_no'
            }, {
                name: 'status',
                type: 'string',
                mapping: 'status_Table.name'
            }]
        }),
        proxy: {
            type: 'ajax',
            url: '/getExpensesList',
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

    var expenses_grid = Ext.create('Ext.grid.Panel', {
        id: 'expenses_grid',
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
            tooltip: 'Add New Expenses',
            hidden: (UN.role < 2) ? true : false,
            border: 1,
            style: {
                borderColor: 'blue',
                borderStyle: 'solid'
            },
            handler: function() {
                expensesFormWindow();
            }
        }, {
            xtype: 'button',
            icon: '/public/icons/clear.png',
            tooltip: 'Clear The Search Boxes',
            border: 1,
            style: {
                borderColor: 'blue',
                borderStyle: 'solid'
            },
            handler: function() {
                Ext.getCmp('Sun_product_type_search').setValue(undefined);
                Ext.getCmp('Sun_coustomer_name_search').setValue(undefined);
                Ext.getCmp('Sun_start_date_search').setValue(undefined);
                Ext.getCmp('Sun_end_date_search').setValue(undefined);
                Ext.getCmp('expenses_grid').getStore().load();
            }
        }, {
            xtype: 'button',
            tooltip: 'Download As PDF',
            icon: '/public/icons/pdf_dowload.png',
            hidden: (UN.role < 2) ? true : false,
            border: 1,
            style: {
                borderColor: 'blue',
                borderStyle: 'solid'
            },
            handler: function() {
                if (Ext.getCmp('expenses_grid')) {
                    var params = Ext.getCmp('expenses_grid').getStore().lastOptions.params;
                    tab_panel.setLoading(true);
                    Ext.Ajax.request({
                        url: '/PrintSalesDataDetails',
                        method: 'POST',
                        params: params,
                        success: function(response, option) {
                            Ext.MessageBox.alert('success', 'Click Here  <a href = "/public/pdf/PrintSalesDataDetails.pdf" target="_blank"> View Printed sheet</a>');
                            tab_panel.setLoading(false);
                        },
                        failure: function(response, option) {},
                        warning: function(response, option) {
                            Ext.MessageBox.alert('waring ', 'There is no data aviable');
                        },
                        scope: this
                    });
                }
            }
        }, {
            xtype: 'button',
            icon: '/public/icons/refresh.png',
            tooltip: 'Reload',
            style: {
                borderColor: 'blue',
                borderStyle: 'solid'
            },
            handler: function() {
                Ext.getCmp('expenses_grid').paramsReload();
            }
        },Ext.create('Ext.form.field.Date', {
            id: 'Sun_start_date_search',
            name: 'from_date',
            padding: 5,
            border: 2,
            style: {
                borderColor: 'green',
                borderStyle: 'solid'
            },
            emptyText: 'শুরু তারিখ...',
            listeners: {
                change: {
                    fn: function(combo, value) {
                        expenses_grid.paramsReload({
                            from_date: value
                        });
                        Ext.getCmp('Sun_end_date_search').setDisabled(false);
                    }
                }
            }
        }), Ext.create('Ext.form.field.Date', {
            id: 'Sun_end_date_search',
            name: 'to_date',
            padding: 5,
            border: 2,
            disabled: true,
            style: {
                borderColor: 'green',
                borderStyle: 'solid'
            },
            emptyText: 'শেষ তারিখ...',
            listeners: {
                change: {
                    fn: function(combo, value) {
                        expenses_grid.paramsReload({
                            to_date: value
                        });
                        Ext.getCmp('Sun_product_type_search').setDisabled(false);
                    }
                }
            }
        }), Ext.create('Ext.form.field.ComboBox', {
            name: 'bricks_class',
            id: 'Sun_product_type_search',
            editable: false,
            disabled: true,
            emptyText: 'ইটের শ্রেণী...',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
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
                    url: '/getBricksClassList',
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
                        expenses_grid.paramsReload({
                            bricks_class: value
                        });
                    }
                }
            }
        }), Ext.create('Ext.form.field.Text', {
            name: 'coustomer_name',
            id: 'Sun_coustomer_name_search',
            emptyText: 'ক্রেতা নাম খুঁজুন...',
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
                            expenses_grid.paramsReload({
                                coustomer_name: value
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
            header: 'তারিখ',
            dataIndex: 'sales_date',
            tdCls: 'x-change-cell',
            renderer: Ext.util.Format.dateRenderer('d-M-Y'),
            align: 'center',
            width: 90,
            editor: {
                xtype: 'datefield',
            },
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
            /*summaryType: 'count',
            summaryRenderer: function(value, summaryData, dataIndex) {
                return '<b><big>TOTAL:</big></b> ';
            }*/
        }, {
            header: 'ক্রেতা নাম',
            dataIndex: 'coustomer_name',
            align: 'left',
            editor: 'textfield',
            width: 130,
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
        }, {
            header: 'ঠিকানা',
            dataIndex: 'coustomer_address',
            align: 'left',
            width: 150,
            editor: 'textfield',
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
        }, {
            header: 'বর্ণনা',
            dataIndex: 'coustomer_details',
            align: 'left',
            editor: 'textfield',
            width: 130,
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
        }, {
            header: 'শ্রেণী',
            dataIndex: 'bricks_class',
            align: 'left',
            // editor: 'textfield',
            width: 75,
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
        }, {
            header: 'পরিমাপ',
            dataIndex: 'bricks_qty',
            align: 'left',
            editor: 'numberfield',
            width: 130,
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },

            summaryType: 'sum',
            summaryRenderer: function(value, summaryData, field, metaData) {
                return '<b><big>' + Ext.String.format('{0}', value) + '</big></b>';
            },
        }, {
            header: 'নীট মূল্য',
            dataIndex: 'net_price',
            align: 'left',
            editor: 'numberfield',
            width: 150,
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
            header: 'মোট জমা',
            dataIndex: 'deposit_taka',
            align: 'left',
            editor: 'numberfield',
            width: 150,
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
            header: 'বাকী',
            dataIndex: 'due',
            align: 'left',
            width: 150,
            renderer: function(value, metaData, recordX, rowIndex, colIndex, store, view) {
                var orderValue = ((recordX.data.net_price) - (recordX.data.deposit_taka));
                return '<b style="color:#cc0000;background-color:#ffddbb">' + orderValue.formatMoney(2, '.', ',') + '</b>';
            },
            summaryRenderer: function(value, summaryData, dataIndex) {
                var thisGrid = Ext.getCmp('expenses_grid').getStore().data;
                var orderValue = 0;
                for (var i = thisGrid.length - 1; i >= 0; i--) {
                    var deposit_taka = parseFloat(thisGrid.items[i].data.deposit_taka);
                    var net_price = parseInt(thisGrid.items[i].data.net_price);
                    orderValue += (net_price - deposit_taka);
                };
                return '<b style="color:#cc0000;background-color:#ffddbb"><big>' + orderValue.formatMoney(2, '.', ',') + '</big></b>';
            },

        }, {
            header: '',
            dataIndex: '',
            align: 'left',
            width: 75,
            renderer: function(value, metaData, recordX, rowIndex, colIndex, store, view) {
                var orderValue = ((recordX.data.net_price) - (recordX.data.deposit_taka));
                console.log(orderValue)
                if (orderValue == 0) {
                    return '<img src="/public/icons/ok.png" class="icon" title="Paid"/>';
                } else {
                    return '<img src="/public/icons/payment-method.png" class="icon" title="Due"/>';
                }
            },

        }, {
            header: 'গাড়ী নং',
            dataIndex: 'vehicles',
            align: 'left',
            // editor: 'textfield',
            width: 110,
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
        }, {
            header: 'গাড়ী ভাড়া',
            dataIndex: 'vehicles_cost',
            align: 'left',
            editor: 'numberfield',
            width: 150,
            listeners: {
                beforerender: function(self, eOpts) {
                    if (UN.role < 2)
                        self.editor = false;
                }
            },
        }, {
            header: 'এড/দা',
            dataIndex: 'remark',
            align: 'left',
            editor: 'textfield',
            width: 150,
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
                                url: '/DestroyExpenses',
                                method: 'POST',
                                params: QUERY,
                                success: function(response) {
                                    if (response.responseText == 'success') {
                                        if (Ext.getCmp('expenses_grid')) {
                                            Ext.getCmp('expenses_grid').getStore().load();
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
    return expenses_grid;
}

function expensesFormWindow() {
    return Ext.create('Ext.window.Window', {
        title: 'বিক্রয়ের প্রয়োজনীয় তথ্য পূরণ করুণ',
        modal: true,
        id: 'expensesFormWindow',
        layout: 'fit',
        items: [Ext.create('Ext.form.Panel', {
            id: 'importStatusFormWindowID',
            width: '35%',
            bodyPadding: 10,
            border: true,
            items: [{
                layout: {
                    type: 'vbox',
                    pack: 'start',
                    align: 'stretch'
                },
                items: [Ext.create('Ext.panel.Panel', {
                    bodyPadding: 10,
                    border: false,
                    layout: {
                        type: 'hbox',
                        pack: 'start',
                        align: 'stretch'
                    },
                    items: [{
                        border: false,
                        layout: {
                            type: 'vbox',
                            pack: 'start',
                            align: 'stretch'
                        },
                        items: [{
                            xtype: 'textfield',
                            name: 'coustomer_name',
                            fieldLabel: 'নাম',
                            filedAlign: 'top',
                            allowBlank: false,
                            width: 300,
                            labelWidth: 90,
                            labelAlign: 'left',
                            labelStyle: 'text-align:left;border solid 1px white;',
                            labelSeparator: '',
                            emptyText: 'ক্রেতার নাম লিখুন...',
                            labelClsExtra: 'some-class',
                            fieldStyle: 'text-align: left;font-size: 12px;',
                            autoScroll: true
                        }, {
                            xtype: 'textfield',
                            name: 'coustomer_address',
                            fieldLabel: 'ঠিকানা',
                            filedAlign: 'top',
                            allowBlank: true,
                            width: 300,
                            labelWidth: 90,
                            labelAlign: 'left',
                            labelStyle: 'text-align:left;border solid 1px white;',
                            labelSeparator: '',
                            emptyText: 'ক্রেতার ঠিকানা লিখুন...',
                            labelClsExtra: 'some-class',
                            fieldStyle: 'text-align: left;font-size: 12px;',
                            autoScroll: true
                        }, {
                            xtype: 'textfield',
                            name: 'coustomer_details',
                            fieldLabel: 'বর্ণনা',
                            filedAlign: 'top',
                            allowBlank: true,
                            width: 300,
                            labelWidth: 90,
                            labelAlign: 'left',
                            labelStyle: 'text-align:left;border solid 1px white;',
                            labelSeparator: '',
                            emptyText: 'ক্রেতার বর্ণনা লিখুন...',
                            labelClsExtra: 'some-class',
                            fieldStyle: 'text-align: left;font-size: 12px;',
                            autoScroll: true
                        }, {
                            xtype: 'numberfield',
                            name: 'bricks_qty',
                            fieldLabel: 'পরিমাপ',
                            filedAlign: 'top',
                            allowBlank: false,
                            width: 300,
                            labelWidth: 90,
                            minValue: 0,
                            labelAlign: 'left',
                            labelStyle: 'text-align:left;border solid 1px white;',
                            labelSeparator: '',
                            emptyText: 'পরিমাপ লিখুন...',
                            labelClsExtra: 'some-class',
                            fieldStyle: 'text-align: left;font-size: 12px;',
                            autoScroll: true
                        }, {
                            xtype: 'numberfield',
                            name: 'net_price',
                            fieldLabel: 'নীট মূল্য',
                            filedAlign: 'top',
                            allowBlank: false,
                            width: 300,
                            labelWidth: 90,
                            minValue: 0,
                            labelAlign: 'left',
                            labelStyle: 'text-align:left;border solid 1px white;',
                            labelSeparator: '',
                            emptyText: 'নীট মূল্য লিখুন...',
                            labelClsExtra: 'some-class',
                            fieldStyle: 'text-align: left;font-size: 12px;',
                            autoScroll: true
                        },{
                                xtype: 'numberfield',
                                name: 'vehicles_cost',
                                fieldLabel: 'গাড়ী ভাড়া',
                                filedAlign: 'top',
                                allowBlank: true,
                                width: 280,
                                labelWidth: 90,
                                minValue: 0,
                                labelAlign: 'left',
                                labelStyle: 'text-align:left;border solid 1px white;',
                                labelSeparator: '',
                                emptyText: 'গাড়ী ভাড়া লিখুন...',
                                labelClsExtra: 'some-class',
                                fieldStyle: 'text-align: left;font-size: 12px;',
                                autoScroll: true
                            } ]
                    }, {
                        border: false,
                        margin: '0 0 0 15',
                        layout: {
                            type: 'vbox',
                            pack: 'start',
                            align: 'stretch'
                        },
                        items: [{
                            xtype: 'numberfield',
                            name: 'deposit_taka',
                            fieldLabel: 'মোট জমা',
                            filedAlign: 'top',
                            allowBlank: false,
                            width: 300,
                            labelWidth: 90,
                            minValue: 0,
                            labelAlign: 'left',
                            labelStyle: 'text-align:left;border solid 1px white;',
                            labelSeparator: '',
                            emptyText: 'মোট জমা লিখুন...',
                            labelClsExtra: 'some-class',
                            fieldStyle: 'text-align: left;font-size: 12px;',
                            autoScroll: true
                        },{
                                xtype: 'datefield',
                                name: 'sales_date',
                                fieldLabel: 'তারিখ',
                                filedAlign: 'top',
                                allowBlank: false,
                                format: 'd F Y',
                                width: 280,
                                editable: false,
                                labelWidth: 90,
                                labelAlign: 'left',
                                labelStyle: 'text-align:left;border solid 1px white;',
                                labelSeparator: '',
                                emptyText: 'তারিখ লিখুন...',
                                labelClsExtra: 'some-class',
                                fieldStyle: 'text-align: left;font-size: 12px;',
                                autoScroll: true
                            }, 
                            /*{
                                                       layout: 'hbox',
                                                       border: false,
                                                       align: 'stretch',
                                                       bodyStyle: 'padding-bottom: 7px;',
                                                       items: [{
                                                           xtype: 'combo',
                                                           name: 'deposit_type',
                                                           fieldLabel: 'জমার ধরন',
                                                           id: 'deposit_type_combo_load',
                                                           allowBlank: false,
                                                           editable: true,
                                                           width: 300,
                                                           labelWidth: 90,
                                                           labelAlign: 'left',
                                                           labelSeparator: '',
                                                           emptyText: 'জমার ধরন  সিলেক্ট করুন...',
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
                                                                   url: '/getDepositTypeList',
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
                                                           tooltip: 'জমার ধরন  যুক্ত করুন ',
                                                           border: 1,
                                                           handler: function() {
                                                               depositTypeFormWindow();
                                                           }
                                                       }]
                                                   },*/
                            {
                                layout: 'hbox',
                                border: false,
                                align: 'stretch',
                                bodyStyle: 'padding-bottom: 7px;',
                                items: [{
                                    xtype: 'combo',
                                    name: 'bricks_class',
                                    fieldLabel: 'শ্রেণী',
                                    id: 'bricks_class_combo_load',
                                    allowBlank: false,
                                    editable: true,
                                    width: 300,
                                    labelWidth: 90,
                                    labelAlign: 'left',
                                    labelSeparator: '',
                                    emptyText: 'ইটের শ্রেণী সিলেক্ট করুন...',
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
                                            url: '/getBricksClassList',
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
                                    tooltip: 'ইটের শ্রেণী যুক্ত করুন',
                                    border: 1,
                                    handler: function() {
                                        bricksClassFormWindow();
                                    }
                                }]
                            }, {
                                layout: 'hbox',
                                border: false,
                                align: 'stretch',
                                bodyStyle: 'padding-bottom: 7px;',
                                items: [{
                                    xtype: 'combo',
                                    name: 'vehicles',
                                    fieldLabel: 'গাড়ী',
                                    id: 'vehicles_combo_load',
                                    allowBlank: false,
                                    editable: false,
                                    width: 300,
                                    labelWidth: 90,
                                    labelAlign: 'left',
                                    labelSeparator: '',
                                    emptyText: 'গাড়ী সিলেক্ট করুন...',
                                    labelClsExtra: 'some-class',
                                    fieldStyle: 'text-align: left;font-size: 12px;',
                                    autoScroll: true,
                                    queryMode: 'local',
                                    displayField: 'vehicle_no',
                                    valueField: 'id',
                                    selectOnFocus: true,
                                    triggerAction: 'all',
                                    anyMatch: true,
                                    typeAhead: true,
                                    transform: 'stateSelect',
                                    forceSelection: true,
                                    store: {
                                        fields: ['id', 'vehicle_no'],
                                        pageSize: 0,
                                        limit: 0,
                                        proxy: {
                                            type: 'ajax',
                                            url: '/getVehiclesList',
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
                                    tooltip: 'গাড়ীর যুক্ত করুন',
                                    border: 1,
                                    handler: function() {
                                        vehiclesFormWindow();
                                    }
                                }]
                            },
                            /*{
                                                           layout: 'hbox',
                                                           border: false,
                                                           align: 'stretch',
                                                           bodyStyle: 'padding-bottom: 7px;',
                                                           items: [{
                                                               xtype: 'combo',
                                                               name: 'status',
                                                               fieldLabel: 'স্ট্যাটাস',
                                                               id: 'status_combo_load',
                                                               allowBlank: false,
                                                               editable: true,
                                                               width: 320,
                                                               labelWidth: 90,
                                                               labelAlign: 'left',
                                                               labelSeparator: '',
                                                               emptyText: 'স্ট্যাটাস  সিলেক্ট করুন ...',
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
                                                                       url: '/getStatusList',
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
                                                               tooltip: 'Add New Product Type',
                                                               border: 1,
                                                               handler: function() {
                                                                   productTypeFormWindow();
                                                               }
                                                           }]
                                                       },*/
                            {
                                xtype: 'textareafield',
                                grow: true,
                                labelWidth: 90,
                                name: 'remark',
                                fieldLabel: 'এড/দা:',
                                anchor: '100%'
                            }
                        ]
                    }]
                })]
            }],
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
                        url: '/CreateExpenses',
                        method: 'POST',
                        params: values,
                        success: function(response) {
                            if (Ext.getCmp('expenses_grid')) {
                                Ext.getCmp('expenses_grid').getStore().load();
                            }
                            Ext.MessageBox.alert('Success', 'Successfully data Inserted');
                            Ext.getCmp('expensesFormWindow').close()
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
                    Ext.getCmp('expensesFormWindow').close()
                }
            }]
        })]
    }).show();
}


function depositTypeFormWindow() {
    return Ext.create('Ext.window.Window', {
        title: 'জমার ধরন  যুক্ত করুন',
        modal: true,
        id: 'depositTypeFormWindow',
        layout: 'fit',
        items: [Ext.create('Ext.form.Panel', {
            width: '35%',
            bodyPadding: 20,
            border: true,
            items: [{
                xtype: 'textfield',
                name: 'name',
                fieldLabel: 'জমার ধরন ',
                filedAlign: 'top',
                allowBlank: false,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'জমার ধরন লিখুন...',
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
                        url: '/CreateDepositType',
                        method: 'POST',
                        params: values,
                        success: function(response) {
                            if (Ext.getCmp('deposit_type_combo_load')) {
                                Ext.getCmp('deposit_type_combo_load').getStore().load();
                            }
                            Ext.MessageBox.alert('Success', 'Successfully data Inserted');
                            Ext.getCmp('depositTypeFormWindow').close()
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
                    Ext.getCmp('depositTypeFormWindow').close()
                }
            }]
        })]
    }).show();
}


function bricksClassFormWindow() {
    return Ext.create('Ext.window.Window', {
        title: 'ইটের শ্রেণী যুক্ত করুন',
        modal: true,
        id: 'bricksClassFormWindow',
        layout: 'fit',
        items: [Ext.create('Ext.form.Panel', {
            width: '35%',
            bodyPadding: 20,
            border: true,
            items: [{
                xtype: 'textfield',
                name: 'name',
                fieldLabel: 'ইটের শ্রেণী ',
                filedAlign: 'top',
                allowBlank: false,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'ইটের শ্রেণী লিখুন...',
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
                        url: '/CreateBricksClass',
                        method: 'POST',
                        params: values,
                        success: function(response) {
                            if (Ext.getCmp('bricks_class_combo_load')) {
                                Ext.getCmp('bricks_class_combo_load').getStore().load();
                            }
                            Ext.MessageBox.alert('Success', 'Successfully data Inserted');
                            Ext.getCmp('bricksClassFormWindow').close()
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
                    Ext.getCmp('bricksClassFormWindow').close()
                }
            }]
        })]
    }).show();
}

function vehiclesFormWindow() {
    return Ext.create('Ext.window.Window', {
        title: 'গাড়ীর যুক্ত করুন',
        modal: true,
        id: 'vehiclesFormWindow',
        layout: 'fit',
        items: [Ext.create('Ext.form.Panel', {
            width: '35%',
            bodyPadding: 20,
            border: true,
            items: [{
                xtype: 'textfield',
                name: 'vehicle_no',
                fieldLabel: 'গাড়ীর নং',
                filedAlign: 'top',
                allowBlank: false,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'গাড়ীর নং লিখুন...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: true
            }, {
                xtype: 'textfield',
                name: 'driver_name',
                fieldLabel: 'চালকের নাম',
                filedAlign: 'top',
                allowBlank: true,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'চালকের নাম লিখুন...',
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
            }],
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
                        url: '/CreateVehical',
                        method: 'POST',
                        params: values,
                        success: function(response) {
                            if (Ext.getCmp('vehicles_combo_load')) {
                                Ext.getCmp('vehicles_combo_load').getStore().load();
                            }
                            Ext.MessageBox.alert('Success', 'Successfully data Inserted');
                            Ext.getCmp('vehiclesFormWindow').close()
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
                    Ext.getCmp('vehiclesFormWindow').close()
                }
            }]
        })]
    }).show();
}