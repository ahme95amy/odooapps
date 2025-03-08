odoo.define('pos_refund_validation.PaymentScreen', function(require) {
    "use strict";

    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const Registries = require('point_of_sale.Registries');
    const { onMounted } = owl.hooks;
    const NumberBuffer = require('point_of_sale.NumberBuffer');
    const { Gui } = require('point_of_sale.Gui');
    var rpc = require('web.rpc');

    const PosPaymentScreen = PaymentScreen => class extends PaymentScreen {
        addNewPaymentLine({ detail: paymentMethod }) {
            var self = this;
            const order = this.env.pos.get_order();
            const refundedLines = order.get_orderlines().filter((line) => line.refunded_orderline_id);

            if (refundedLines.length > 0) {
                const OriginalOrderID = this.env.pos.get_order().pos.TICKET_SCREEN_STATE.ui.selectedSyncedOrderId;

                var params = {
                    model: 'pos.order',
                    method: 'search_read',
                    domain: [['id', '=', OriginalOrderID]],
                    fields: [],
                };

                rpc.query(params).then(function(result) {
                    var PaymentDictionary = {
                        paymentMethod: 0,
                        OriginalPaymentMethodIDs: [],
                        OriginalPaymentMethodNames: []
                    };

                    var OriginalPaymentMethodLineIDs = result[0].payment_ids;
                    var promises = OriginalPaymentMethodLineIDs.map(function(item) {
                        return rpc.query({
                            model: 'pos.payment',
                            method: 'read',
                            args: [item]
                        }).then(function(result3) {
                            PaymentDictionary.paymentMethod = result3[0].payment_method_id[0];
                            PaymentDictionary.OriginalPaymentMethodIDs.push(PaymentDictionary.paymentMethod);
                            PaymentDictionary.OriginalPaymentMethodNames.push(result3[0].payment_method_id[1]);
                        });
                    });

                    Promise.all(promises).then(function() {
                        const RefundPaymentMethodID = paymentMethod.id;
                        if (PaymentDictionary.OriginalPaymentMethodIDs.includes(RefundPaymentMethodID)) {
                            let result = self.currentOrder.add_paymentline(paymentMethod);
                            if (result) {
                                NumberBuffer.reset();
                                return true;
                            } else {
                                this.showPopup('ErrorPopup', {
                                    title: self.env._t('Error'),
                                    body: self.env._t('There is already an electronic payment in progress.'),
                                });
                                return false;
                            }
                        } else {
                            Gui.showPopup('ErrorPopup', {
                                'title': 'Payment Validation',
                                'body': 'It should be refunded using the same payment method of the original order.\nThe original payment method/s was/were ' + '"' + PaymentDictionary.OriginalPaymentMethodNames + '"' + '.',
                            });
                            return false;
                        }
                    });
                });
            } else {
                let result = this.currentOrder.add_paymentline(paymentMethod);
                if (result) {
                    NumberBuffer.reset();
                    return true;
                } else {
                    this.showPopup('ErrorPopup', {
                        title: self.env._t('Error'),
                        body: self.env._t('There is already an electronic payment in progress.'),
                    });
                    return false;
                }
            }
        }
    };

    Registries.Component.extend(PaymentScreen, PosPaymentScreen);
    return PaymentScreen;
});
