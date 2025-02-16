"use client"

import { useState, useEffect } from "react"
import { signOut, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from "firebase/auth"
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore"
import { auth, db } from "../firebase/config"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ProjectManagement } from "./ProjectManagement"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog"
import { useAuth } from "../contexts/AuthContext"
import type { ProfileData, Education } from "../types"
import { Badge } from "./ui/badge"
import { LogOut, Trash2, Edit3, Briefcase, User, ArrowRight, Settings } from "lucide-react"
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar"

export default function Dashboard() {
  const navigate = useNavigate()
  const user = auth.currentUser
  const { currentUser } = useAuth()
  const [profile, setProfile] = useState<ProfileData>({
    displayName: user?.displayName || "",
    bio: "",
    education: [],
    hobbies: "",
    age: 0 // default age value
  })
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setProfile(docSnap.data() as ProfileData)
          } else {
            await setDoc(docRef, profile)
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
          setError("Failed to load profile. Please try again later.")
        }
      }
    }
    fetchProfile()
  }, [user, profile])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (error) {
      console.error("Error signing out:", error)
      setError("Failed to sign out. Please try again.")
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const user = auth.currentUser
      if (user) {
        // Reauthenticate user before deleting
        const provider = new GoogleAuthProvider()
        await reauthenticateWithPopup(user, provider)
        
        await deleteDoc(doc(db, "users", user.uid))
        await deleteUser(user)
        await signOut(auth)
        navigate("/")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      setError("Failed to delete account. Please try again.")
    }
  }

  const links = [
    {
      label: "Profile",
      href: "#profile",
      icon: <User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Projects",
      href: "#projects",
      icon: <Briefcase className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Settings",
      href: "#settings",
      icon: <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
  ]

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-neutral-900">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Link to="#" className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
              <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
              <span className="font-medium text-black dark:text-white whitespace-pre">Dashboard</span>
            </Link>
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} onClick={() => setActiveTab(link.href.slice(1))} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: profile.displayName || "User",
                href: "#",
                icon: (
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src={user?.photoURL || ""} alt={profile.displayName || "User"} />
                    <AvatarFallback>{profile.displayName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>

          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your profile details and education history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.photoURL || ""} alt={profile.displayName || "User"} />
                    <AvatarFallback>{profile.displayName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-semibold">{profile.displayName || "Name not set"}</h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <p className="text-muted-foreground">Age: {profile.age || "Not set"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Bio</h3>
                    <p className="text-muted-foreground">{profile.bio || "No bio provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Education</h3>
                    {profile.education.length > 0 ? (
                      <div className="space-y-4">
                        {profile.education.map((edu: Education, index: number) => (
                          <Card key={index}>
                            <CardContent className="pt-6">
                              <h4 className="font-semibold">{edu.school}</h4>
                              <p>
                                {edu.degree} - {edu.specialization}
                              </p>
                              <p className="text-muted-foreground">
                                {edu.startYear} - {edu.endYear === "present" ? "Present" : edu.endYear}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No education history provided</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Hobbies</h3>
                    <p className="text-muted-foreground">{profile.hobbies || "No hobbies listed"}</p>
                  </div>
                </div>
                <Link to="/edit-profile">
                  <Button className="mt-6 w-full sm:w-auto" variant="outline">
                    <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {activeTab === "projects" && (
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Manage your ongoing and completed projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectManagement />
              </CardContent>
            </Card>
          )}

          {activeTab === "settings" && (
            <Card className="mt-6 border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove your data from
                      our servers.
                    </DialogDescription>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline">
                        Cancel
                      </Button>
                      <Button onClick={handleDeleteAccount} variant="destructive">
                        Yes, delete my account
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {currentUser && (
            <Card className="mt-6 overflow-hidden">
              <CardHeader className="bg-white">
                <CardTitle className="text-2xl font-bold text-black">Your Portfolio Showcase</CardTitle>
                <CardDescription className="text-black/80">
                  Share your professional journey with the world
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold mb-2">Shareable Link</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className="text-xs px-2 py-1">
                        Public URL
                      </Badge>
                      <Link to={`/portfolio/${currentUser.uid}`} className="text-primary hover:underline break-all">
                        {`${window.location.origin}/portfolio/${currentUser.uid}`}
                      </Link>
                    </div>
                  </div>
                  <Button variant="outline" className="shrink-0">
                    <Link to={`/portfolio/${currentUser.uid}`} className="flex items-center">
                      View Portfolio <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

