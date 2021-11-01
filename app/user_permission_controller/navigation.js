function navigationTab(UN) {
    if (Ext.getCmp('navigation_tab')) {
        tab_panel.setActiveTab(Ext.getCmp("navigation_tab"));
    } else {
        var new_tab = tab_panel.add({
            id: 'navigation_tab',
            title: 'Navigation',
            layout: 'fit',
            closable: true,
            autoScroll: false,
            items: [Ext.create('Ext.grid.Panel', {
                id: 'navigation_grid',
                autoScroll: true,
                columnLines: true,
                loadMask: true,
                frame: true,
                store: {
                    proxy: {
                        type: 'ajax',
                        url: '/getNavigationList'
                    },
                    autoLoad: true,
                    autoSync: false,
                    model: Ext.define('NAVIGATION_MODEL', {
                        extend: 'Ext.data.Model',
                        fields: [{
                            name: 'id',
                            type: 'int'
                        }, {
                            name: 'name',
                            type: 'string'
                        }, {
                            name: 'key',
                            type: 'string'
                        }, {
                            name: 'parent',
                            type: 'string',
                            mapping: 'Parent_Table.name'
                        }]
                    })
                },
                columns: [Ext.create('Ext.grid.RowNumberer', {
                    width: 50
                }), {
                    header: 'NAME',
                    dataIndex: 'name',
                    listeners: {
                        beforerender: function(self, eOpts) {
                            if (UN.role < 2)
                                self.editor = false;
                        }
                    },
                    editor: 'textfield',
                    flex: 1
                }, {
                    header: 'KEY',
                    dataIndex: 'key',
                    listeners: {
                        beforerender: function(self, eOpts) {
                            if (UN.role < 2)
                                self.editor = false;
                        }
                    },
                    editor: 'textfield',
                    flex: 1
                }, {
                    header: 'PARENT',
                    dataIndex: 'parent',
                    editor: 'textfield',
                    flex: 1,
                    listeners: {
                        beforerender: function(self, eOpts) {
                            if (UN.role < 2)
                                self.editor = false;
                        }
                    },
                    editor: {
                        xtype: 'combo',
                        name: 'navigation',
                        id: 'navigation_update_combo',
                        allowBlank: false,
                        editable: false,
                        width: 300,
                        labelWidth: 80,
                        labelAlign: 'left',
                        labelSeparator: '',
                        labelClsExtra: 'some-class',
                        fieldStyle: 'text-align: left;font-size: 12px;',
                        autoScroll: true,
                        displayField: 'name',
                        valueField: 'id',
                        selectOnFocus: true,
                        triggerAction: 'all',
                        forceSelection: true,
                        store: {
                            fields: ['id', 'name'],
                            proxy: {
                                type: 'ajax',
                                url: '/getNavigationParent'
                            },
                            autoLoad: true,
                            autoSync: true
                        },
                    },
                }, {
                    xtype: 'actioncolumn',
                    header: 'DELETE',
                    flex: 0.3,
                    hideable: true,
                    listeners: {
                        afterrender: function(cmp) {
                            cmp.hidden = (UN.role > 2) ? false : true;
                        }
                    },
                    items: [{
                        icon: '/public/icons/delete.png',
                        tooltip: 'Delete',
                        handler: function(grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            Ext.Msg.show({
                                title: 'Delete Promotion?',
                                msg: 'Are you sure you want to delete this information. <br>It will permanently delete this information from the server',
                                buttons: Ext.Msg.YESNO,
                                icon: Ext.Msg.WARNING,
                                fn: function(btn, text) {
                                    if (btn == 'yes') {
                                        socket.emit('DestroyNavigation', rec.id).on('DestroyNavigationSMS', function(message) {
                                            if (message == "success") {
                                                if (Ext.getCmp('navigation_grid')) {
                                                    Ext.getCmp('navigation_grid').getStore().load();
                                                }
                                                Ext.MessageBox.alert('Success', 'Successfully data Deleted');
                                            } else if (message == "error") {
                                                Ext.MessageBox.alert('Error',
                                                    'Please contact with the developer');
                                            } else {
                                                Ext.MessageBox.alert('Unauthorized',
                                                    'You are not authorized to perform this task. ' +
                                                    'Repeatedly doing this might block your ID');
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }],
                    align: 'center'
                }],
                selModel: 'cellmodel',
                plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2,
                    autoCancel: false
                })],
                listeners: {
                    edit: function(column, rowIndex) {
                        var rec = {}
                        rec.id = rowIndex.record.data.id
                        rec.data = {}
                        rec.data[rowIndex.field] = rowIndex.value
                        socket.emit('UpdateNavigation', rec).on('UpdateNavigationSMS', function(message) {
                            if (message == "success") {
                                if (Ext.getCmp('navigation_grid')) {
                                    Ext.getCmp('navigation_grid').getStore().load();
                                }
                            } else if (message == "error") {
                                Ext.MessageBox.alert('Error',
                                    'Please contact with the developer');
                            } else {
                                Ext.MessageBox.alert('Unauthorized',
                                    'You are not authorized to perform this task. ' +
                                    'Repeatedly doing this might block your ID');
                            }
                        })
                    }
                }
            })],
            tbar: [{
                xtype: 'button',
                icon: '/public/icons/create.png',
                name: 'AddNew',
                text: 'Add New',
                tooltip: 'Add New',
                border: 1,
                style: {
                    borderColor: 'blue',
                    borderStyle: 'solid'
                },
                hidden: (UN.role > 2) ? false : true,
                handler: function() {
                    navigationFormWindow();
                }
            }, {
                xtype: 'button',
                icon: '/public/icons/refresh.png',
                iconCls: 'add',
                name: 'reload',
                tooltip: 'Reload',
                border: 1,
                style: {
                    borderColor: 'blue',
                    borderStyle: 'solid'
                },
                handler: function() {
                    Ext.getCmp('navigation_grid').getStore().load();
                }
            }]
        });
        tab_panel.setActiveTab(new_tab);
    }
}

function navigationFormWindow() {
    return Ext.create('Ext.window.Window', {
        title: 'Add New Navigation',
        modal: true,
        id: 'navigationFormWindow',
        layout: 'fit',
        items: [Ext.create('Ext.form.Panel', {
            id: 'navigationForm',
            width: '35%',
            bodyPadding: 20,
            border: true,
            items: [{
                xtype: 'textfield',
                name: 'name',
                fieldLabel: 'Name',
                filedAlign: 'top',
                allowBlank: false,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'Give Navigation Name...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: true
            }, {
                xtype: 'combo',
                name: 'parent',
                fieldLabel: 'Parent',
                // allowBlank: false,
                editable: false,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelSeparator: '',
                emptyText: 'Select Navigation Parent...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: true,
                queryMode: 'local',
                displayField: 'name',
                valueField: 'id',
                selectOnFocus: true,
                triggerAction: 'all',
                store: {
                    fields: ['id', 'name'],
                    proxy: {
                        type: 'ajax',
                        url: '/getNavigationParent'
                    },
                    autoLoad: true,
                    autoSync: true
                },
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
                    values.key = values.name.replace(/\s+/g, '_').toLowerCase();
                    for (var key in values) {
                        if (values[key] === '') {
                            values[key] = null;
                        }
                    }
                    if (form.isValid()) {
                        socket.emit('CreateNavigation', values).on('CreateNavigationSMS', function(message) {
                            if (message == "success") {
                                if (Ext.getCmp('navigation_grid')) {
                                    Ext.getCmp('navigation_grid').getStore().load();
                                }
                                Ext.MessageBox.alert('Success', 'Successfully data inserted')
                                Ext.getCmp('navigationFormWindow').close()
                            } else if (message == "error") {
                                Ext.MessageBox.alert('Error', 'Data not inserted. \nPossible problem could be duplicate entry');
                            }
                        });

                    }
                }
            }, {
                text: 'Close',
                handler: function() {
                    Ext.getCmp('navigationFormWindow').close()
                }
            }]
        })]
    }).show();
}