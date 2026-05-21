from django.shortcuts import render


def price_estimator_page(request):
    return render(request, "annonces/price_estimator.html")

