#= This is a script to tidy up the dictionary.json file to fit what I want it to do
   1) Make everything lowercase
   2) Remove non alphanumeric from all words (I feel like this is better for demonstration purposes)
=#

import JSON

# Read the old dictionary into a dict
dict = Dict()
open("dictionary.json", "r") do f
    global dict
    dict = JSON.parse(readstring(f))
end

# Create a new dict to store the cleansed keys, while looping over the old dict
obj = Dict()
for word in dict
    key = lowercase(word[1])
    key = replace(key, r"\W", "")
    obj[key] = word[2]
end

# Write the data to the tidied file
data = JSON.json(obj)
open("new_dictionary.json", "w") do f
    write(f, data)
end
