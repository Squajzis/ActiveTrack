const axios = require('axios');
const Activity = require('../models/Activity'); // Twój model aktywności
const querystring = require('querystring');

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_URL = 'https://www.strava.com/api/v3';

// TODO: W DOCELOWEJ APLIKACJI, TOKENY MUSZĄ BYĆ PRZECHOWYWANE W BAZIE DANYCH
// I POWIĄZANE Z KONKRETNYM UŻYTKOWNIKIEM TWOJEJ APLIKACJI.
// PRZECHOWYWANIE ICH GLOBALNIE PONIŻEJ JEST TYLKO DLA CELÓW DEMONSTRACYJNYCH
// I JEST NIEBEZPIECZNE W ŚRODOWISKU PRODUKCYJNYM.
let stravaAccessToken = null;
let stravaRefreshToken = null;
let tokenExpiresAt = null; // Timestamp wygaśnięcia tokenu (w milisekundach)


// Krok 1: Przekierowanie użytkownika do Strava w celu autoryzacji
exports.redirectToStravaAuth = (req, res) => {
  const scope = 'read,activity:read_all'; // Wymagane uprawnienia
  const authUrl = `${STRAVA_AUTH_URL}?client_id=${process.env.STRAVA_CLIENT_ID}&redirect_uri=${process.env.STRAVA_REDIRECT_URI}&response_type=code&scope=${scope}`;
  res.redirect(authUrl);
};

// Krok 2: Obsługa przekierowania zwrotnego i wymiana kodu na tokeny
exports.handleStravaCallback = async (req, res, next) => {
  const code = req.query.code;
  const error = req.query.error;

  if (error) {
      // Użytkownik odmówił autoryzacji lub wystąpił inny błąd
      console.error('Strava authorization error:', error);
      // TODO: Przekieruj użytkownika na stronę informującą o błędzie lub anulowaniu
      return res.redirect('/?strava_auth_error=' + error); // Przykładowe przekierowanie
  }

  if (!code) {
    // Brak kodu autoryzacyjnego
    console.error('Strava callback: No authorization code received.');
     // TODO: Przekieruj użytkownika na stronę błędu
    return res.redirect('/?strava_auth_error=no_code');
  }

  try {
    const response = await axios.post(STRAVA_TOKEN_URL, querystring.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Zapisz tokeny (TYMCZASOWO GLOBALNIE!)
    stravaAccessToken = response.data.access_token;
    stravaRefreshToken = response.data.refresh_token;
    tokenExpiresAt = response.data.expires_at * 1000; // Konwersja na milisekundy

    console.log('Strava tokens obtained successfully.');
    // TODO: W DOCELOWEJ APLIKACJI: Zapisz stravaAccessToken, stravaRefreshToken i tokenExpiresAt
    // w bazie danych powiązane z aktualnie zalogowanym użytkownikiem Twojej aplikacji.
    // Usuń globalne zmienne po wdrożeniu systemu użytkowników.

    // Przekieruj użytkownika z powrotem do aplikacji, np. na stronę importu lub pulpit
    // Możesz dodać parametr wskazujący, że autoryzacja Strava zakończyła się sukcesem
    res.redirect('/?strava_auth_success=1'); // Przykładowe przekierowanie
  } catch (error) {
    console.error('Error exchanging Strava code for tokens:', error.response ? error.response.data : error.message);
    // TODO: Przekieruj użytkownika na stronę błędu informującą o problemie z wymianą kodu na tokeny
    next(error); // Przekaż błąd dalej do middleware obsługi błędów
  }
};

// Funkcja pomocnicza do odświeżania tokenu dostępu
const refreshStravaToken = async () => {
    // TODO: W DOCELOWEJ APLIKACJI: Ta funkcja powinna pobierać refresh token
    // dla aktualnie zalogowanego użytkownika z bazy danych.
    if (!stravaRefreshToken) {
        throw new Error('No refresh token available.');
    }

    try {
         const response = await axios.post(STRAVA_TOKEN_URL, querystring.stringify({
            client_id: process.env.STRAVA_CLIENT_ID,
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: stravaRefreshToken // Użyj zapisanego refresh tokenu
         }), {
             headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
             }
         });

         // Zaktualizuj tokeny (TYMCZASOWO GLOBALNIE!)
         stravaAccessToken = response.data.access_token;
         stravaRefreshToken = response.data.refresh_token; // Może się zmienić
         tokenExpiresAt = response.data.expires_at * 1000;

         console.log('Strava token refreshed successfully.');
         // TODO: W DOCELOWEJ APLIKACJI: Zaktualizuj stravaAccessToken, stravaRefreshToken i tokenExpiresAt
         // dla tego użytkownika w bazie danych.

    } catch (error) {
        console.error('Error refreshing Strava token:', error.response ? error.response.data : error.message);
         // TODO: W DOCELOWEJ APLIKACJI: Jeśli odświeżenie tokenu się nie powiedzie (np. refresh token wygasł),
         // użytkownik może wymagać ponownej autoryzacji Strava. Oznacz użytkownika jako "niepołączonego" ze Strava.
        throw new Error('Failed to refresh Strava token');
    }
};


// Krok 3 & 4 & 5: Importowanie aktywności
exports.importStravaActivities = async (req, res, next) => {
    // TODO: W DOCELOWEJ APLIKACJI: Zidentyfikuj aktualnie zalogowanego użytkownika
    // i pobierz jego tokeny Strava z bazy danych.
    let currentAccessToken = stravaAccessToken; // Tymczasowo użyj globalnego tokenu

    if (!currentAccessToken) {
        return res.status(401).json({ message: 'Brak połączenia ze Strava. Proszę najpierw połączyć konto.' });
    }

    // Sprawdź, czy token dostępu wygasł i odśwież go, jeśli tak
    // TODO: W DOCELOWEJ APLIKACJI: Sprawdź expiresAt dla danego użytkownika
    if (tokenExpiresAt && Date.now() >= tokenExpiresAt - (60 * 1000)) { // Odśwież chwilę przed wygaśnięciem (np. 60s zapasu)
        console.log('Access token expired or near expiration, refreshing...');
        try {
            await refreshStravaToken(); // Ta funkcja zaktualizuje globalne tokeny w tym przykładzie
             currentAccessToken = stravaAccessToken; // Użyj nowego tokenu
        } catch (error) {
             // Błąd odświeżania tokenu - poinformuj użytkownika o konieczności ponownego połączenia
             return res.status(401).json({ message: 'Token Strava wygasł i nie udało się go odświeżyć. Proszę połączyć konto Strava ponownie.' });
        }
    }


    try {
        // Pobierz aktywności z Strava API
        const activitiesResponse = await axios.get(`${STRAVA_API_URL}/athlete/activities`, {
          headers: {
            'Authorization': `Bearer ${currentAccessToken}` // Użyj (odświeżonego) tokenu
          },
          params: {
            per_page: 100, // Limit aktywności na stronę (max 200)
            // Możesz dodać parametry `before` i `after` (timestamp) do importu tylko nowych aktywności
            // np. po ostatniej zaimportowanej dacie. Wymaga zapisania daty ostatniego importu per użytkownik.
            // after: <timestamp ostatniego importu>
          }
        });

        const stravaActivities = activitiesResponse.data;
        console.log(`Workspaceed ${stravaActivities.length} activities from Strava.`);

        const importedActivities = [];
        const skippedCount = 0; // Licznik pominiętych duplikatów
        const BATCH_SIZE = 50; // Zapisuj w partiach, aby nie przeciążać bazy i pamięci

        // TODO: W DOCELOWEJ APLIKACJI: Pobierz listę istniejących aktywności użytkownika
        // aby sprawdzić duplikaty przed dodaniem. Możesz porównać po dacie i dystansie
        // lub użyć unikalnego identyfikatora Strava, jeśli go zapiszesz w modelu Activity.

        // Przetwarzaj i zapisuj aktywności partiami
        for (let i = 0; i < stravaActivities.length; i += BATCH_SIZE) {
            const batch = stravaActivities.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map(async (stravaActivity) => {
                 // Mapowanie danych ze Strava na model ActiveTrack
                const newActivityData = {
                    // Strava activity types: Run, Ride, Swim, etc.
                    // Musisz zmapować te typy na swoje 'run', 'workout', 'other'
                    type: mapStravaTypeToActiveTrack(stravaActivity.type),
                    name: stravaActivity.name || `Strava ${stravaActivity.type || 'Activity'}`, // Lepsza nazwa domyślna
                    date: new Date(stravaActivity.start_date_local), // Data i czas rozpoczęcia
                    duration: stravaActivity.moving_time ? stravaActivity.moving_time / 60 : null, // Czas w minutach
                    distance: stravaActivity.distance ? stravaActivity.distance / 1000 : null, // Dystans w km
                    calories: stravaActivity.calories || null,
                    avgHeartRate: stravaActivity.average_heartrate || null,
                    pace: stravaActivity.distance > 0 && stravaActivity.moving_time > 0 ? (stravaActivity.moving_time / 60) / (stravaActivity.distance / 1000) : null, // min/km
                    speed: stravaActivity.average_speed ? stravaActivity.average_speed * 3.6 : null, // m/s na km/h
                    notes: stravaActivity.description || '', // Importuj opis jako notatki
                    // TODO: Jeśli Strava API zwraca unikalny identyfikator aktywności, dodaj pole `stravaId: { type: Number, unique: true }` do modelu Activity
                    // i zapisz go tutaj: stravaId: stravaActivity.id
                };

                // TODO: W DOCELOWEJ APLIKACJI: Tutaj dodaj logikę sprawdzania duplikatów
                // const existing = await Activity.findOne({ stravaId: newActivityData.stravaId, user: req.user._id }); // Przykładowe sprawdzenie duplikatu per użytkownik
                // if (existing) {
                //     skippedCount++; // Zwiększ licznik pominiętych
                //     return null; // Pomiń tworzenie
                // }

                try {
                    const createdActivity = await Activity.create(newActivityData);
                    return createdActivity;
                } catch (dbError) {
                    console.error('Error saving activity to DB:', dbError);
                    // Możesz obsłużyć błędy walidacji lub inne błędy DB tutaj
                    return null; // Nie dodawaj do listy zaimportowanych, jeśli zapis się nie powiódł
                }
            });

            const results = await Promise.all(batchPromises);
            importedActivities.push(...results.filter(result => result !== null)); // Dodaj tylko te, które zostały pomyślnie zapisane/nie były duplikatami
        }


        res.status(200).json({
            message: `Pomyślnie zaimportowano ${importedActivities.length} aktywności ze Strava.` // TODO: Uwzględnij skippedCount w komunikacie
             // imported: importedActivities // Opcjonalnie zwróć zaimportowane obiekty
        });

      } catch (error) {
        console.error('Error importing Strava activities:', error.response ? error.response.data : error.message);

        // Sprawdź, czy błąd dotyczy nieważnego tokenu dostępu (częsty przypadek po wygaśnięciu)
        if (error.response && error.response.status === 401) {
             // Oznacz użytkownika jako "niepołączonego" ze Strava w bazie danych
             // I poinformuj go, że musi ponownie połączyć konto
             return res.status(401).json({ message: 'Token Strava jest nieważny. Proszę połączyć konto Strava ponownie.' });
        }


        next(error); // Przekaż inne błędy dalej
      }
    };

    // Funkcja mapująca typy aktywności Strava na typy ActiveTrack
    const mapStravaTypeToActiveTrack = (stravaType) => {
        switch (stravaType) {
            case 'Run':
                return 'run';
            case 'WeightTraining':
            case 'Workout':
            case 'Crossfit': // Dodaj inne typy treningów siłowych/mieszanych ze Strava
            case 'HighIntensityIntervalTraining':
                return 'workout';
            case 'Ride': // Jazda na rowerze
            case 'Swim': // Pływanie
            case 'Walk': // Spacer
            case 'Hiking': // Wędrówka
            case 'Yoga': // Joga
            // Dodaj inne typy aktywności, które chcesz zmapować
                return 'other';
            default:
                return 'other'; // Wszystkie inne typy jako "inne"
        }
    };