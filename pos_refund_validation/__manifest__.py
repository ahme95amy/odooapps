{
    'name': 'Validate POS Payment Refund',
    'summary': 'Allow to refund orders with specific payment method.',
    'description': """Validate the selected payment method for refunding order
  only if that payment method is same as the one which selected for it's original sale order.""",
    'version': '15.0.1.0.0',
    'category': 'Point of Sale',
    'author': 'Ahmed Alnahal',
    'maintainer': 'Ahmed Alnahal',
    'website': 'https://www.linkedin.com/in/ahmed-alnahal-b7b38b261/',
    'license': 'LGPL-3',
    'depends': ['web', 'base', 'point_of_sale'],
    'data': [
    ],
    'assets': {
        'web.assets_backend': [
            'pos_refund_validation/static/src/js/payment_screen.js'
        ],
    },
    'images': ['static/description/banner.png'],
    'installable': True,
    'application': True,
    'auto_install': False,
}
