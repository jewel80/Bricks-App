function userTab(UN) {
    if (Ext.getCmp('user_tab')) {
        tab_panel.setActiveTab(Ext.getCmp("user_tab"));
    } else {
        var new_tab = tab_panel.add({
            title: 'User',
            layout: 'fit',
            closable: true,
            autoScroll: false,
            id: 'user_tab',
            tbar: [{
                xtype: 'button',
                icon: '/public/icons/create.png',
                name: 'AddNew',
                id: 'userAddNew',
                text: 'Add New',
                tooltip: 'Add New',
                border: 1,
                style: {
                    borderColor: 'blue',
                    borderStyle: 'solid'
                },
                hidden: (UN.role > 2) ? false : true,
                handler: function() {
                    userFormWindow();
                }
            }, {
                xtype: 'button',
                // text: 'Reload',
                icon: '/public/icons/refresh.png',
                iconCls: 'add',
                name: 'reload',
                id: 'userTabReload',
                tooltip: 'Reload',
                border: 1,
                style: {
                    borderColor: 'blue',
                    borderStyle: 'solid'
                },
                handler: function() {
                    Ext.getCmp('user_grid').getStore().load();
                }
            }],
            items: [Ext.create('Ext.grid.Panel', {
                id: 'user_grid',
                autoScroll: true,
                columnLines: true,
                loadMask: true,
                frame: true,
                store: {
                    proxy: {
                        type: 'ajax',
                        url: '/getUserList'
                    },
                    autoLoad: true,
                    autoSync: false,
                    model: Ext.define('USER_MODEL', {
                        extend: 'Ext.data.Model',
                        fields: [{
                            name: 'id',
                            type: 'int'
                        }, {
                            name: 'username',
                            type: 'string'
                        }, {
                            name: 'password',
                            type: 'string'
                        }, {
                            name: 'employee',
                            type: 'string',
                            mapping: 'Employee_Table.name'
                        }]
                    })
                },
                selModel: 'cellmodel',
                plugins: [Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2,
                    autoCancel: false
                })],
                columns: [Ext.create('Ext.grid.RowNumberer', {
                    width: 50
                }), {
                    header: 'USER NAME',
                    dataIndex: 'username',
                    listeners: {
                        beforerender: function(self, eOpts) {
                            if (UN.role < 2)
                                self.editor = false;
                        }
                    },
                    editor: 'textfield',
                    flex: 1
                }, {
                    header: 'LAST LOGIN',
                    dataIndex: 'last_login',
                    hideable: true,
                    listeners: {
                        afterrender: function(cmp) {
                            cmp.hidden = (UN.role > 2) ? false : true;
                        }
                    },
                    flex: 1
                }, {
                    header: 'LAST LOGOUT',
                    dataIndex: 'last_logout',
                    hideable: true,
                    listeners: {
                        afterrender: function(cmp) {
                            cmp.hidden = (UN.role > 2) ? false : true;
                        }
                    },
                    flex: 1
                }, {
                    xtype: 'actioncolumn',
                    header: 'PERMISSION',
                    hideable: true,
                    listeners: {
                        afterrender: function(cmp) {
                            cmp.hidden = (UN.role > 2) ? false : true;
                        }
                    },
                    flex: 0.5,
                    align: 'center',
                    items: [{
                        icon: '/public/icons/next.png',
                        tooltip: 'Permission',
                        handler: function(grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            userPermissionSelectionWindow(rec.data);
                        }
                    }]
                }, {
                    xtype: 'actioncolumn',
                    header: 'PASSWORD',
                    hideable: true,
                    listeners: {
                        afterrender: function(cmp) {
                            cmp.hidden = (UN.role > 2) ? false : true;
                        }
                    },
                    flex: 0.8,
                    items: [{
                        icon: '/public/icons/password.png',
                        tooltip: 'Change Password',
                        handler: function(grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            changePasswordWindow(rec)
                        }
                    }],
                    align: 'center'
                }, {
                    xtype: 'actioncolumn',
                    header: 'DELETE',
                    hideable: true,
                    listeners: {
                        afterrender: function(cmp) {
                            cmp.hidden = (UN.role > 2) ? false : true;
                        }
                    },
                    flex: 0.5,
                    items: [{
                        icon: '/public/icons/delete.png',
                        tooltip: 'Delete',
                        handler: function(grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            if (rec.id === UN.user) {
                                Ext.MessageBox.alert('Unauthorized', 'Committing Suicide Is Strictly Forbidden in Islam');
                            } else if (rec.id < UN.user) {
                                Ext.MessageBox.alert('Unauthorized', 'You Are Trying To Overtake Your Boss');
                            } else {
                                Ext.Msg.show({
                                    title: 'Delete Promotion?',
                                    msg: 'Are you sure you want to delete this information. <br>It will permanently delete this information from the server',
                                    buttons: Ext.Msg.YESNO,
                                    icon: Ext.Msg.WARNING,
                                    fn: function(btn, text) {
                                        if (btn == 'yes') {
                                            socket.emit('DestroyUser', rec.id).on('DestroyUserSMS', function(message) {
                                                if (message == "success") {
                                                    if (Ext.getCmp('user_grid')) {
                                                        Ext.getCmp('user_grid').getStore().load();
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
                                })
                            }
                        }
                    }],
                    align: 'center'
                }],
                listeners: {
                    edit: function(column, rowIndex) {
                        var rec = {}
                        rec.id = rowIndex.record.data.id
                        rec.data = {}
                        rec.data[rowIndex.field] = rowIndex.value
                        socket.emit('UpdateUser', rec).on('UpdateUserSMS', function(message) {
                            if (message == "success") {
                                if (Ext.getCmp('user_grid')) {
                                    Ext.getCmp('user_grid').getStore().load();
                                }
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
            })]
        })
        tab_panel.setActiveTab(new_tab)
    }
}

function changePasswordWindow(rec) {
    return Ext.create('Ext.window.Window', {
        title: 'Change Password',
        modal: true,
        id: 'userFormWindow',
        layout: 'fit',
        items: [Ext.create('Ext.form.Panel', {
            width: '35%',
            bodyPadding: 20,
            border: true,
            items: [{
                xtype: 'textfield',
                inputType: 'password',
                fieldLabel: 'Password',
                name: 'password',
                filedAlign: 'top',
                allowBlank: false,
                width: 300,
                // minLength: 8,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'Give Password ...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: true
            }, {
                xtype: 'textfield',
                inputType: 'password',
                fieldLabel: 'Confirm',
                name: 'confirm',
                filedAlign: 'top',
                allowBlank: false,
                width: 300,
                // minLength: 8,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'Confirm Password ...',
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
                id: 'user_submit_button',
                formBind: true,
                handler: function() {
                    var panel = this.up('form');
                    var form = panel.getForm();
                    var values = form.getValues();
                    if (form.isValid()) {
                        if (values.password == values.confirm) {
                            values.id = rec.id
                            socket.emit('ChangePassword', values).on('ChangePasswordSMS', function(message) {
                                if (message == "success") {
                                    if (Ext.getCmp('user_grid')) {
                                        Ext.getCmp('user_grid').getStore().load();
                                    }
                                    Ext.MessageBox.alert('Success', 'Successfully data inserted')
                                    Ext.getCmp('userFormWindow').close()
                                } else if (message == "error") {
                                    Ext.MessageBox.alert('Error', 'Data not inserted. \nPossible problem could be duplicate entry');
                                }
                            });
                        } else {
                            Ext.MessageBox.alert('Error', 'Password Does Not Match');
                        }
                    }
                }
            }, {
                text: 'Close',
                handler: function() {
                    Ext.getCmp('userFormWindow').close()
                }
            }]
        })]
    }).show();
}

function userFormWindow() {
    return Ext.create('Ext.window.Window', {
        title: 'Add New User',
        modal: true,
        id: 'userFormWindow',
        layout: 'fit',
        items: [Ext.create('Ext.form.Panel', {
            width: '35%',
            bodyPadding: 20,
            border: true,
            items: [{
                xtype: 'textfield',
                name: 'name',
                fieldLabel: 'Name ',
                filedAlign: 'top',
                allowBlank: false,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'Give Name ...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: true
            }, {
                xtype: 'textfield',
                name: 'username',
                fieldLabel: 'User Name ',
                filedAlign: 'top',
                allowBlank: false,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'Give User Name ...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: true
            }, {
                xtype: 'textfield',
                name: 'email',
                fieldLabel: 'Email ',
                filedAlign: 'top',
                allowBlank: false,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'Give Email Address ...',
                labelClsExtra: 'some-class',
                fieldStyle: 'text-align: left;font-size: 12px;',
                autoScroll: true
            }, {
                xtype: 'textfield',
                inputType: 'password',
                fieldLabel: 'Password',
                name: 'password',
                filedAlign: 'top',
                allowBlank: false,
                width: 300,
                labelWidth: 80,
                labelAlign: 'left',
                labelStyle: 'text-align:left;border solid 1px white;',
                labelSeparator: '',
                emptyText: 'Give Password ...',
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
                id: 'user_submit_button',
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
                    if (form.isValid()) {
                        socket.emit('CreateUser', values).on('CreateUserSMS', function(message) {
                            if (message == "success") {
                                if (Ext.getCmp('user_grid')) {
                                    Ext.getCmp('user_grid').getStore().load();
                                }
                                Ext.MessageBox.alert('Success', 'Successfully data inserted')
                                Ext.getCmp('userFormWindow').close()
                            } else if (message == "error") {
                                Ext.MessageBox.alert('Error', 'Data not inserted. \nPossible problem could be duplicate entry');
                            }
                        });
                    }
                }
            }, {
                text: 'Close',
                handler: function() {
                    Ext.getCmp('userFormWindow').close()
                }
            }]
        })]
    }).show();
}

function userPermissionSelectionWindow(rec) {
    return Ext.create('Ext.window.Window', {
        title: '<b>' + rec.username + ' Permission Slection Window</b>',
        modal: true,
        width: '60%',
        height: 350,
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        items: [
            userPermissionUnselectedGrid(rec),
            userPermissionSelectedGrid(rec)
        ]
    }).show();
}

function userPermissionUnselectedGrid(user) {
    return Ext.create('Ext.grid.Panel', {
        id: 'userPermissionUnselectedGrid',
        width: '38%',
        autoScroll: true,
        store: {
            proxy: {
                type: 'ajax',
                url: '/userNavigationUnselected/' + user.id
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
                    mapping: 'parent.name'
                }]
            })
        },
        border: true,
        columnLines: true,
        autoScroll: true,
        loadMask: true,
        viewConfig: {
            emptyText: 'No records'
        },
        columns: [{
            header: 'NAVIGATION UNSELECTED',
            dataIndex: 'name',
            align: 'left',
            flex: 1
        }, {
            xtype: 'actioncolumn',
            header: 'ADD',
            flex: 0.4,
            align: 'center',
            items: [{
                icon: '/public/icons/next.png',
                tooltip: 'Add',
                handler: function(grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    var values = {};
                    values.user = user.id
                    values.navigation = rec.id
                    for (var key in values) {
                        if (values[key] === '') {
                            values[key] = null;
                        }
                    }
                    socket.emit('CreateUserNavigation', values).on('CreateUserNavigationSMS', function(message) {
                        if (message == "success") {
                            if (Ext.getCmp('userPermissionUnselectedGrid')) {
                                Ext.getCmp('userPermissionUnselectedGrid').getStore().load();
                            }
                            if (Ext.getCmp('userPermissionSelectedGrid')) {
                                Ext.getCmp('userPermissionSelectedGrid').getStore().load();
                            }
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
            }]
        }]
    });
}

function userPermissionSelectedGrid(rec) {
    return Ext.create('Ext.grid.Panel', {
        id: 'userPermissionSelectedGrid',
        autoScroll: true,
        width: '62%',
        store: {
            proxy: {
                type: 'ajax',
                url: '/userNavigationSelected/' + rec.id
            },
            autoLoad: true,
            autoSync: false,
            model: Ext.define('USER_NAVIGATION_MODEL', {
                extend: 'Ext.data.Model',
                fields: [{
                    name: 'id',
                    type: 'int'
                }, {
                    name: 'user',
                    type: 'string',
                    mapping: 'User_Table.username'
                }, {
                    name: 'navigation',
                    type: 'string',
                    mapping: 'Navigation_Table.name'
                }, {
                    name: 'employee',
                    type: 'string',
                    mapping: 'Navigation_Table.name'
                }]
            })
        },
        autoScroll: true,
        loadMask: true,
        border: true,
        columnLines: true,
        viewConfig: {
            emptyText: 'No records'
        },
        columns: [{
            header: 'NAVIGATION SELECTED',
            dataIndex: 'navigation',
            align: 'left',
            width: 200
        }, {
            header: 'GUEST',
            dataIndex: 'id',
            renderer: function(value, metaData, record, rowIdx, colIdx, store, view) {
                var o = {}
                o.id = value
                o.role = 1
                var checked = (parseInt(record.get('role')) === 1) ? true : false
                return "<input type='radio' name = 'role" + value + "' " + (checked ? "checked='checked'" : "") + " onclick='updateUserNavRole(`" + JSON.stringify(o) + "`)'>";
            },
            width: 70,
            align: 'center',
        }, {
            header: 'EDITOR',
            dataIndex: 'id',
            renderer: function(value, metaData, record, rowIdx, colIdx, store, view) {
                var o = {}
                o.id = value
                o.role = 2
                var checked = (parseInt(record.get('role')) === 2) ? true : false
                return "<input type='radio' name = 'role" + value + "' " + (checked ? "checked='checked'" : "") + " onclick='updateUserNavRole(`" + JSON.stringify(o) + "`)'>";
            },
            width: 70,
            align: 'center',
        }, {
            header: 'ADMIN',
            dataIndex: 'id',
            renderer: function(value, metaData, record, rowIdx, colIdx, store, view) {
                var o = {}
                o.id = value
                o.role = 3
                var checked = (parseInt(record.get('role')) === 3) ? true : false
                return "<input type='radio' name = 'role" + value + "' " + (checked ? "checked='checked'" : "") + " onclick='updateUserNavRole(`" + JSON.stringify(o) + "`)'>";
            },
            width: 70,
            align: 'center',
        }, {
            xtype: 'actioncolumn',
            header: 'REMOVE',
            width: 85,
            align: 'center',
            items: [{
                icon: '/public/icons/previous.png',
                tooltip: 'Remove',
                handler: function(grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    socket.emit('DestroyUserNavigation', rec.id).on('DestroyUserNavigationSMS', function(message) {
                        if (message == "success") {
                            if (Ext.getCmp('userPermissionUnselectedGrid')) {
                                Ext.getCmp('userPermissionUnselectedGrid').getStore().load();
                            }
                            if (Ext.getCmp('userPermissionSelectedGrid')) {
                                Ext.getCmp('userPermissionSelectedGrid').getStore().load();
                            }
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
            }]
        }]
    });
}

function updateUserNavRole(a) {
    var b = JSON.parse(a)
    socket.emit('UpdateUserNavigationRole', b).on('UpdateUserNavigationRoleSMS', function(message) {
        if (message == "success") {
            if (Ext.getCmp('userPermissionSelectedGrid')) {
                Ext.getCmp('userPermissionSelectedGrid').getStore().load();
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