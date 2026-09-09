from catalog.models import Whisky

print("Mapping flavor profiles for the radar charts...")

precise_profiles = {
    # M&H and Golani from your screenshot
    "Classic Single Malt": {"smoke": 0, "brine": 5, "wood": 40, "fruit": 75},
    "Elements Peated": {"smoke": 60, "brine": 15, "wood": 45, "fruit": 40},
    "Apex Dead Sea": {"smoke": 5, "brine": 85, "wood": 65, "fruit": 30},
    "Apex Pomegranate Cask": {"smoke": 0, "brine": 5, "wood": 50, "fruit": 90},
    "Golani Single Malt": {"smoke": 0, "brine": 0, "wood": 55, "fruit": 65},
    "Ex-Bourbon": {"smoke": 0, "brine": 0, "wood": 80, "fruit": 45},
    
    # Islay Heavyweights
    "Port Askaig 100° Proof": {"smoke": 85, "brine": 65, "wood": 40, "fruit": 30},
    "Uigeadail": {"smoke": 80, "brine": 50, "wood": 75, "fruit": 60},
    "10 Year Old Cask Strength": {"smoke": 95, "brine": 80, "wood": 65, "fruit": 20},
}

for whisky in Whisky.objects.all():
    if whisky.name in precise_profiles:
        profile = precise_profiles[whisky.name]
        whisky.smoke = profile["smoke"]
        whisky.brine = profile["brine"]
        whisky.wood = profile["wood"]
        whisky.fruit = profile["fruit"]
    else:
        # Smart dynamic estimation for the rest of the catalog
        whisky.smoke = 75 if whisky.is_peated else 0
        whisky.brine = 40 if whisky.is_peated else 5
        whisky.wood = 80 if whisky.is_cask_strength else 45
        whisky.fruit = 25 if whisky.is_peated else 70
        
    whisky.save()

print("Tasting maps successfully calibrated!")