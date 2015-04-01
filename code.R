## Load required libraries
library(dplyr)
library(maptools)
library(ggplot2)
install.packages("gpclib")


## Load all the raw data and merge into single data frame
data1995.2000 <- read.csv("house_prices/London Year_1995-2000.csv", header=T)
data2001.2006 <- read.csv("house_prices/London Year_2001-2006.csv", header=T)
data2007.2012 <- read.csv("house_prices/London Year_2007-2012.csv", header=T)
data2013 <- read.csv("house_prices/London Year_2013.csv", header=T)
raw.data <- rbind(data1995.2000,data2001.2006,data2007.2012,data2013)
size <- nrow(raw.data)
head(raw.data)

## Select only select required columns
required.columns <- c("id","price","quarter","year","county","post_code_clean",
                      "inner_outer","borough_code","borough_name","ward_code","ward_name",
                      "msoa11","lsoa11","oa11")

data <- raw.data[,required.columns]

# Filter by county - only keep Greater London transactions
london <- unique(raw.data$county)[1]
data <- data[data$county=="GREATER LONDON",]

# Create 2013_price column
# Nominal prices converted to 2013 prices by using the 
# UK Statistics RPI index

# Load price indices
rpi <- read.csv("quarterlyRPIforAnalysis.csv",header=T)

# Create price indices vector for data set
rpi_full <- rep(0,nrow(data))
for (i in 1:length(rpi_full)){
  
  quarter <- data[i,3]
  year <- data[i,4]
  pos <- match(year,rpi[,2])
  rpi_full[i] <- rpi[(pos+quarter-1),3]
}

data["price_2013"] <- data$price / rpi_full # convert prices to 2013 level

# Select only required columns
data.reduced <- data[,c(3,4,9,10,11,15)]
data.reduced["period"] <- paste(data.reduced[,2],data.reduced[,1],sep="-")
data.reduced <- data.reduced[,c(7,3,4,5,6,1,2)]
count <- rep(1,nrow(data.reduced))
data.reduced["count"] <- count
head(data.reduced)

## Analysis by quarter

# Summarise the data for average price by quarter
sum.data.quarter <- data.reduced %>%
  group_by(ward_name, ward_code, period, borough_name) %>%
  summarise(avg.price = mean(price_2013))
sum.data.quarter <- data.frame(sum.data.quarter)

# Summarise the data for number of transactions by year
sum.data.quarter.freq <- data.reduced %>%
  group_by(ward_name, ward_code, year, borough_name) %>%
  summarise(transactions = sum(count))
sum.data.quarter.freq <- data.frame(sum.data.quarter.freq)

# Load the geographical data
map <- readShapePoly("WD_DEC_2014_GB_BFE.shp")

map@data$id <- rownames(map@data)
# Note: need to have the package "gpclib" installed
gpclibPermit()
map2 <- fortify(map, region = "id")
# Convert map in dataframe
mapDF <- merge(map2, map@data, by = "id")

# Extract data for Greater London using the names of all 33 boroughs

# Barking and Dagenham
barking.dagenham.DF <- mapDF[mapDF[,12]=="Barking and Dagenham",]
# Barnet
barnet.DF <- mapDF[mapDF[,12]=="Barnet",]
# Bexley
bexley.DF <- mapDF[mapDF[,12]=="Bexley",]
# Brent
brent.DF <- mapDF[mapDF[,12]=="Brent",]
# Bromley
bromley.DF <- mapDF[mapDF[,12]=="Bromley",]
# Camden
camden.DF <- mapDF[mapDF[,12]=="Camden",]
# Croydon
croydon.DF <- mapDF[mapDF[,12]=="Croydon",]
# Ealing
ealing.DF <- mapDF[mapDF[,12]=="Ealing",]
# Enfield
enfield.DF <- mapDF[mapDF[,12]=="Enfield",]
# Greenwich
greenwich.DF <- mapDF[mapDF[,12]=="Greenwich",]
# Hackney
hackney.DF <- mapDF[mapDF[,12]=="Hackney",]
# Hammersmith and Fulham
hammersmith.fulham.DF <- mapDF[mapDF[,12]=="Hammersmith and Fulham",]
# Haringey
haringey.DF <- mapDF[mapDF[,12]=="Haringey",]
# Harrow
harrow.DF <- mapDF[mapDF[,12]=="Harrow",]
# Havering
havering.DF <- mapDF[mapDF[,12]=="Havering",]
# Hillingdon
hillingdon.DF <- mapDF[mapDF[,12]=="Hillingdon",]
# Hounslow
hounslow.DF <- mapDF[mapDF[,12]=="Hounslow",]
# Islington
islington.DF <- mapDF[mapDF[,12]=="Islington",]
# Kensington and Chelsea
kensington.chelsea.DF <- mapDF[mapDF[,12]=="Kensington and Chelsea",]
# Kingston upon Thames
kingston.DF <- mapDF[mapDF[,12]=="Kingston upon Thames",]
# Lambeth
lambeth.DF <- mapDF[mapDF[,12]=="Lambeth",]
# Lewisham
lewisham.DF <- mapDF[mapDF[,12]=="Lewisham",]
# Merton
merton.DF <- mapDF[mapDF[,12]=="Merton",]
# Newham
newham.DF <- mapDF[mapDF[,12]=="Newham",]
# Redbridge
redbridge.DF <- mapDF[mapDF[,12]=="Redbridge",]
# Richmond upon Thames
richmond.DF <- mapDF[mapDF[,12]=="Richmond upon Thames",]
# Southwark
southwark.DF <- mapDF[mapDF[,12]=="Southwark",]
# Sutton
sutton.DF <- mapDF[mapDF[,12]=="Sutton",]
# Tower Hamlets
tower.hamlets.DF <- mapDF[mapDF[,12]=="Tower Hamlets",]
# Waltham Forest
waltham.forest.DF <- mapDF[mapDF[,12]=="Waltham Forest",]
# Wandsworth
wandsworth.DF <- mapDF[mapDF[,12]=="Wandsworth",]
# Westminster
westminster.DF <- mapDF[mapDF[,12]=="Westminster",]
# City of London
city.DF <- mapDF[mapDF[,12]=="City of London",]
city.DF$WD14NM <- "City of London"
# Note: the price data for the City of London is not available at ward level
# hence I assign to each ward the same average price. This does not affect
# the visualisation of the analysis which instead focuses on residential areas 
# of London (the City is primarily a commercial district)

# Join individual boroughs maps into a single map for London
london.DF <- rbind(barking.dagenham.DF, barnet.DF, bexley.DF,
                   brent.DF, bromley.DF, camden.DF, city.DF,
                   croydon.DF, ealing.DF, enfield.DF, greenwich.DF,
                   hackney.DF, hammersmith.fulham.DF, haringey.DF,
                   harrow.DF, havering.DF, hillingdon.DF, hounslow.DF,
                   islington.DF, kensington.chelsea.DF, kingston.DF,
                   lambeth.DF, lewisham.DF, merton.DF, newham.DF, redbridge.DF,
                   richmond.DF, southwark.DF, sutton.DF, tower.hamlets.DF,
                   waltham.forest.DF, wandsworth.DF, westminster.DF)

# Fix misplellings and mismatches
fix <- with(london.DF, levels(WD14NM))
fix[fix == "St Margarets and North Twickenham"] <- "St. Margarets and North Twickenham"
fix[fix == "Bethnal Green"] <- "Bethnal Green North"
fix[fix == "Blackwall & Cubitt Town"] <- "Blackwall and Cubitt Town"
fix[fix == "Bromley North"] <- "Mile End and Globe Town"
fix[fix == "Bromley South"] <- "Mile End and Globe Town"
fix[fix == "Brompton & Hans Town"] <- "Brompton"
fix[fix == "Hoxton East & Shoreditch"] <- "Hoxton"
fix[fix == "Hoxton West"] <- "Hoxton"
fix[fix == "Mile End"] <- "Mile End and Globe Town"
fix[fix == "Notting Dale"] <- "Notting Barns"
fix[fix == "Spitalfields & Banglatown"] <- "Spitalfields and Banglatown"
fix[fix == "St Andrew's"] <- "St. Andrew's"
fix[fix == "St Ann's"] <- "St. Ann's"
fix[fix == "St Dunstan's"] <- "St. Dunstan's and Stepney Green"
fix[fix == "St George's"] <- "St. George's"
fix[fix == "St Helier"] <- "St. Helier"
fix[fix == "St James"] <- "St. James"
fix[fix == "St James's"] <- "St. James's"
fix[fix == "St Katharine's & Wapping"] <- "St. Katharine's and Wapping"
fix[fix == "St Leonard's"] <- "St. Leonard's"
fix[fix == "St Mark's"] <- "St. Mark's"
fix[fix == "St Mary's"] <- "St. Mary's"
fix[fix == "St Mary's Park"] <- "St. Mary's Park"
fix[fix == "St Michael's"] <- "St. Michael's"
fix[fix == "St Pancras and Somers Town"] <- "St. Pancras and Somers Town"
fix[fix == "St Peter's"] <- "St. Peter's"
fix[fix == "Stoke Newington"] <- "Stoke Newington Central"
fix[fix == "Canary Wharf"] <- "Blackwall and Cubitt Town"
fix[fix == "Island Gardens"] <- "Blackwall and Cubitt Town"
fix[fix == "Poplar"] <- "Blackwall and Cubitt Town"
fix[fix == "Lansbury"] <- "Mile End and Globe Town"
fix[fix == "Hackney Wick"] <- "Hackney Central"
fix[fix == "London Fields"] <- "Hackney Central"
fix[fix == "London Fields"] <- "Hackney Central"
fix[fix == "Homerton"] <- "Hackney Central"
fix[fix == "Stepney Green"] <- "Shadwell"
fix[fix == "Stamford Hill West"] <- "Cazenove"
fix[fix == "Woodberry Down"] <- "Finsbury Park"
fix[fix == "Dalgarno"] <- "Golborne"
fix[fix == "Shacklewell"] <- "Hackney Downs"
fix[fix == "St. George's"] <- "Tooting"
fix[fix == "Chelsea Riverside"] <- "Royal Hospital"
fix[fix == "St. Helen's"] <- "Golborne"
london.DF <- within(london.DF, levels(WD14NM) <- fix)

# Cleaning up the data frame
london.DF <- london.DF[,c(1,2,3,7,8,9,11,12)] # Keep relevant columns
colnames(london.DF) <- c("id","lat","lon","group","ward_code","ward_name", # renaming columns
                         "borough_code","borough_name") 

# Find Points-of-Interest
pois.lat <- london.DF[,c(2,3,8)] %>%
  group_by(borough_name) %>%
  summarise(avg.lat = mean(lat))
pois.lat <- data.frame(pois.lat)

pois.lon <- london.DF[,c(2,3,8)] %>%
  group_by(borough_name) %>%
  summarise(avg.lon = mean(lon))
pois.lon <- data.frame(pois.lon)

pois <- merge(pois.lat,pois.lon,by="borough_name")
group <- rep(0,nrow(pois))
price <- rep(0,nrow(pois))
freq <- rep(0,nrow(pois))
pois <- cbind(pois,group,price,freq)
colnames(pois) <- c("borough_name","long","lat","group","price","freq")

## GENERATE AND SAVE PLOTS
## Note: the working directory should have two subfolders named
## 'charts/price' and 'charts/freq' where the plots will be saved.

## Prices

quarters <- c("1995-1","1995-2","1995-3","1995-4",
              "1996-1","1996-2","1996-3","1996-4",
              "1997-1","1997-2","1997-3","1997-4",
              "1998-1","1998-2","1998-3","1998-4",
              "1999-1","1999-2","1999-3","1999-4",
              "2000-1","2000-2","2000-3","2000-4",
              "2001-1","2001-2","2001-3","2001-4",
              "2002-1","2002-2","2002-3","2002-4",
              "2003-1","2003-2","2003-3","2003-4",
              "2004-1","2004-2","2004-3","2004-4",
              "2005-1","2005-2","2005-3","2005-4",
              "2006-1","2006-2","2006-3","2006-4",
              "2007-1","2007-2","2007-3","2007-4",
              "2008-1","2008-2","2008-3","2008-4",
              "2009-1","2009-2","2009-3","2009-4",
              "2010-1","2010-2","2010-3","2010-4",
              "2011-1","2011-2","2011-3","2011-4",
              "2012-1","2012-2","2012-3","2012-4",
              "2013-1","2013-2","2013-3","2013-4")

for (i in 1:length(quarters)) {
  
  # Extract quarter price data and match with geographic data
  quarter <- sum.data.quarter[sum.data.quarter[,3]==quarters[i],]
  quarter <- quarter[,c(1,2,5)]
  places <- london.DF[,6]
  prices <- rep(0,nrow(london.DF))
  prices <- quarter[match(places, quarter[,1]),3]
  prices <- (round(prices/50000,0)*50000)
  prices[prices<=200000] <- 200000
  prices[prices>=1100000] <- 1050000
  london.DF["price"] <- prices
  
  ## Draw chart for prices ##
  
  breaks <- c(200000,250000,300000,350000,400000,450000,
              500000,550000,600000,650000,700000,750000,
              800000,850000,900000,950000,1000000,1050000)
  
  price.chart <- ggplot(data = london.DF, aes(x=lat, y=lon, group = group, fill=price)) +
    geom_polygon(alpha=0.8)  +
    
    scale_fill_gradientn(colours=topo.colors(18),na.value = "blue",
                         breaks = breaks,
                         limits=c(200000,1050000), guide = FALSE) +
    coord_equal() +
    theme(line = element_blank(),
          line = element_blank(),
          title = element_blank(),
          text = element_blank())
  
  # Add boroughs names
  price.chart2 <- price.chart + geom_point(data=pois, aes(x= pois$long, y= pois$lat),
                                           size=3.5,col="black") +
    geom_point(data=pois, aes(x= pois$long, y= pois$lat),
               size=2,col="white") +
    geom_text(data=pois, aes(pois$long, pois$lat, 
                             label = pois$borough_name),
              size=3, vjust=1.5, col="black")     
  
  # Define and add charts label
  quarter <- substr(quarters[i], 6, 6)
  year <- substr(quarters[i],1,4)
  label <- paste("Q",quarter," ",year,sep="")
  price.chart.text <- price.chart2 + 
    annotate("text", x=559000, y=155000, label=label, col="Black", size=8)
  
  # Save current plots
  ggsave(price.chart.text,filename=paste("charts/price/",periods[i],"-price.png",sep=""),
         width=10, height=10, dpi=120) 
}


## Frequencies

years <- c("1995","1996","1997","1998","1999","2000",
           "2001","2002","2003","2004","2005","2006",
           "2007","2008","2009","2010","2011","2012","2013")

for (i in 1:length(years)) {
  
  # Extract quarter frequency data and match with geographic data
  year <- sum.data.quarter.freq[sum.data.quarter.freq[,3]==years[i],]
  year <- year[,c(1,2,5)]
  places <- london.DF[,6]
  freq <- rep(0,nrow(london.DF))
  freq <- year[match(places, year[,1]),3]
  freq <- (round(freq/100,0)*100)
  freq[freq=0] <- 0
  freq[freq>=500] <- 5000
  london.DF["freq"] <- freq
  
  ## Draw chart for frequencies
  
  breaks.freq <- c(0,50,100,150,200,250,300,350,
                   400,450,500)
  
  freq.chart <- ggplot(data = london.DF, aes(x=lat, y=lon, group = group, fill=freq)) +
    geom_polygon(alpha=0.8)  +
    
    scale_fill_gradientn(colours=heat.colors(11),na.value = "red",
                         breaks = breaks.freq,
                         limits=c(0,500), guide = FALSE) +
    coord_equal() +
    theme(line = element_blank(),
          line = element_blank(),
          title = element_blank(),
          text = element_blank())
  
  # Add boroughs names
  freq.chart2 <- freq.chart + geom_point(data=pois, aes(x= pois$long, y= pois$lat),
                                         size=3.5,col="black") +
    geom_point(data=pois, aes(x= pois$long, y= pois$lat),
               size=2,col="white") +
    geom_text(data=pois, aes(pois$long, pois$lat, 
                             label = pois$borough_name),
              size=3, vjust=1.5, col="black")
  
  label <- years[i]
  
  freq.chart.text <- freq.chart2 + 
    annotate("text", x=559000, y=155000, label=label, col="Black", size=8)
  
  ggsave(freq.chart.text,filename=paste("charts/freq/",years[i],"-freq.png",sep=""),
         width=10, height=10, dpi=120) 
  
}