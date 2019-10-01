https://www.onlinegdb.com/online_python_compiler

'''

                            Online Python Compiler.
                Code, Compile, Run and Debug python program online.
Write your code in this editor and press "Run" button to execute it.

'''
movies = [{'Rating': 96, 'Reviews': 483, 'Title': 'Black Panther', 'Year': 2018},
 {'Rating': 98, 'Reviews': 114, 'Title': 'The Wizard of Oz', 'Year': 1939},
 {'Rating': 97, 'Reviews': 408, 'Title': 'Mad Max: Fury Road', 'Year': 2015},
 {'Rating': 93, 'Reviews': 434, 'Title': 'Wonder Woman', 'Year': 2017},
 {'Rating': 98, 'Reviews': 128, 'Title': 'E.T. The Extra-Terrestrial', 'Year': 1982},
 {'Rating': 99, 'Reviews': 122, 'Title': 'Metropolis', 'Year': 1927},
 {'Rating': 91,
  'Reviews': 451,
  'Title': 'Star Wars: The Last Jedi',
  'Year': 2017},
 {'Rating': 100,
  'Reviews': 44,
  'Title': 'The Bride of Frankenstein',
  'Year': 1935},
 {'Rating': 92, 'Reviews': 420, 'Title': 'The Shape of Water', 'Year': 2017},
 {'Rating': 94, 'Reviews': 408, 'Title': 'Arrival', 'Year': 2016},
 {'Rating': 93, 'Reviews': 396, 'Title': 'Thor: Ragnarok', 'Year': 2017},
 {'Rating': 93, 'Reviews': 394, 'Title': 'Logan', 'Year': 2017},
 {'Rating': 98,
  'Reviews': 49,
  'Title': 'Snow White and the Seven Dwarfs',
  'Year': 1937},
 {'Rating': 96, 'Reviews': 345, 'Title': 'Gravity', 'Year': 2013},
 {'Rating': 93,
  'Reviews': 418,
  'Title': 'Star Wars: Episode VII - The Force Awakens',
  'Year': 2015},
 {'Rating': 97,
  'Reviews': 63,
  'Title': 'Nosferatu, a Symphony of Horror',
  'Year': 1922},
 {'Rating': 94,
  'Reviews': 339,
  'Title': 'War for the Planet of the Apes',
  'Year': 2017},
 {'Rating': 97, 'Reviews': 117, 'Title': 'Alien', 'Year': 1979},
 {'Rating': 92,
  'Reviews': 374,
  'Title': 'Spider-Man: Homecoming',
  'Year': 2017},
 {'Rating': 94, 'Reviews': 333, 'Title': 'The Dark Knight', 'Year': 2008},
 {'Rating': 91,
  'Reviews': 395,
  'Title': 'Captain America: Civil War',
  'Year': 2016},
 {'Rating': 100, 'Reviews': 46, 'Title': 'Frankenstein', 'Year': 1931},
 {'Rating': 98, 'Reviews': 85, 'Title': 'Dr. Strangelove', 'Year': 1964},
 {'Rating': 100, 'Reviews': 49, 'Title': 'Pinocchio', 'Year': 1940},
 {'Rating': 96,
  'Reviews': 328,
  'Title': 'Harry Potter and the Deathly Hallows - Part 2',
  'Year': 2011},
 {'Rating': 93,
  'Reviews': 119,
  'Title': 'Star Wars: Episode IV - A New Hope',
  'Year': 1977},
 {'Rating': 88, 'Reviews': 400, 'Title': 'Ant-Man and the Wasp', 'Year': 2018},
 {'Rating': 99, 'Reviews': 71, 'Title': 'Aliens', 'Year': 1986},
 {'Rating': 94, 'Reviews': 346, 'Title': 'Star Trek', 'Year': 2009},
 {'Rating': 93, 'Reviews': 286, 'Title': 'Sorry to Bother You', 'Year': 2018},
 {'Rating': 87, 'Reviews': 419, 'Title': 'Blade Runner 2049', 'Year': 2017},
 {'Rating': 98,
  'Reviews': 56,
  'Title': 'Invasion of the Body Snatchers',
  'Year': 1956},
 {'Rating': 97,
  'Reviews': 215,
  'Title': 'Kubo and the Two Strings',
  'Year': 2016},
 {'Rating': 99,
  'Reviews': 208,
  'Title': 'How to Train Your Dragon',
  'Year': 2010},
 {'Rating': 91, 'Reviews': 359, 'Title': 'The Martian', 'Year': 2015},
 {'Rating': 92, 'Reviews': 346, 'Title': "Marvel's The Avengers", 'Year': 2012},
 {'Rating': 85,
  'Reviews': 444,
  'Title': 'Avengers: Infinity War',
  'Year': 2018},
 {'Rating': 93, 'Reviews': 76, 'Title': "It's a Wonderful Life", 'Year': 1946},
 {'Rating': 95, 'Reviews': 64, 'Title': 'Beauty and The Beast', 'Year': 1946},
 {'Rating': 100, 'Reviews': 60, 'Title': 'The Terminator', 'Year': 1984}]

def find_movies(rating, reviews):
    title_list = []
    for i in range(len(movies)):
        rating_list = movies[i]
        if rating_list['Rating'] >= int(rating) and rating_list['Reviews'] >= int(reviews):
            title_list.append(rating_list)
    return title_list
    
def create_my_dict(rating_threshold, review_threshold):
    result = {
        'years':{},
        'ratings':{
            'high_rating':[],
            'low_rating':[]
        },
        'reviews':{
            'high_review':[],
            'low_review':[]
        }
    }
    for movie in movies:
        if movie['Year'] in result['years']:
            result['years'][movie['Year']].append(movie['Title'])
        else:
            result['years'][movie['Year']] = [movie['Title']]
        if movie['Rating'] >= rating_threshold:
            result['ratings']['high_rating'].append(movie['Title'])
        else:
            result['ratings']['low_rating'].append(movie['Title'])
        if movie['Reviews'] >= review_threshold:
            result['reviews']['high_review'].append(movie['Title'])
        else:
            result['reviews']['low_review'].append(movie['Title'])
    return result
#print(find_movies(93, 200))
#print(create_my_dict(93, 200))

from statistics import mean

def avg_score_query(start_year, stop_year):
    rating_list = []
    review_list = []
    title_list = []

    for movie in movies:
        if movie['Year'] >= start_year and movie['Year'] <= stop_year:
            rating_list.append(movie['Rating'])
            review_list.append(movie['Reviews'])
            title_list.append(movie['Title'])

    avg_rating = round(mean(rating_list),1)
    avg_review = round(mean(review_list))
    titles = ', '.join(sorted(title_list))
    print(review_list)
    return "From " + str(start_year) + " to " + str(stop_year) + ", these movies (" + titles + ") have a rating of " + str(avg_rating) + " and " + str(avg_review) + " reviews on average."
    
print (avg_score_query(2016, 2018))
